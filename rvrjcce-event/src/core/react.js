/**
 * Modern High-Performance React Core & DOM Reconciler
 * Conforms to standard React Component and Hooks specifications.
 */

let activeInstance = null;
let hookCursor = 0;
let renderQueue = new Set();
let isBatching = false;

export function createElement(type, props, ...children) {
  props = props || {};
  const flatChildren = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child === null || child === undefined || child === false || child === true) {
      continue;
    }
    if (Array.isArray(child)) {
      for (let j = 0; j < child.length; j++) {
        const nested = child[j];
        if (nested !== null && nested !== undefined && nested !== false && nested !== true) {
          flatChildren.push(
            typeof nested === 'object' ? nested : createTextElement(nested)
          );
        }
      }
    } else if (typeof child === 'object') {
      flatChildren.push(child);
    } else {
      flatChildren.push(createTextElement(child));
    }
  }

  const normalizedProps = { ...props };
  if (flatChildren.length > 0) {
    normalizedProps.children = flatChildren.length === 1 ? flatChildren[0] : flatChildren;
  }

  return {
    $$typeof: Symbol.for('react.element'),
    type,
    props: normalizedProps,
    key: props.key != null ? String(props.key) : null,
    ref: props.ref || null
  };
}

function createTextElement(text) {
  return {
    $$typeof: Symbol.for('react.element'),
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: String(text),
      children: []
    },
    key: null
  };
}

export function Fragment(props) {
  return createElement('div', {
    className: 'react-fragment',
    style: { display: 'contents' }
  }, props ? props.children : null);
}

export function useState(initialState) {
  if (!activeInstance) {
    throw new Error('useState must be called inside a component');
  }
  const inst = activeInstance;
  const idx = hookCursor++;

  if (inst.hooks[idx] === undefined) {
    inst.hooks[idx] = typeof initialState === 'function' ? initialState() : initialState;
  }

  const setState = (action) => {
    const current = inst.hooks[idx];
    const next = typeof action === 'function' ? action(current) : action;
    if (!Object.is(current, next)) {
      inst.hooks[idx] = next;
      scheduleUpdate(inst);
    }
  };

  return [inst.hooks[idx], setState];
}

export function useEffect(callback, deps) {
  if (!activeInstance) {
    throw new Error('useEffect must be called inside a component');
  }
  const inst = activeInstance;
  const idx = hookCursor++;
  const oldHook = inst.hooks[idx];

  const hasChanged = !oldHook || !deps || deps.some((dep, i) => !Object.is(dep, oldHook.deps[i]));

  if (hasChanged) {
    inst.pendingEffects.push({
      callback,
      deps,
      hookIndex: idx
    });
  }
}

export function useRef(initialValue) {
  if (!activeInstance) {
    throw new Error('useRef must be called inside a component');
  }
  const inst = activeInstance;
  const idx = hookCursor++;

  if (inst.hooks[idx] === undefined) {
    inst.hooks[idx] = { current: initialValue };
  }

  return inst.hooks[idx];
}

export function useMemo(factory, deps) {
  if (!activeInstance) {
    throw new Error('useMemo must be called inside a component');
  }
  const inst = activeInstance;
  const idx = hookCursor++;
  const oldHook = inst.hooks[idx];

  const hasChanged = !oldHook || !deps || deps.some((dep, i) => !Object.is(dep, oldHook.deps[i]));

  if (hasChanged) {
    const value = factory();
    inst.hooks[idx] = { value, deps };
    return value;
  }

  return oldHook.value;
}

export function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

function scheduleUpdate(instance) {
  renderQueue.add(instance);
  if (!isBatching) {
    isBatching = true;
    queueMicrotask(flushUpdates);
  }
}

function flushUpdates() {
  isBatching = false;
  const instances = Array.from(renderQueue);
  renderQueue.clear();

  for (const inst of instances) {
    if (inst.isMounted) {
      inst.update();
    }
  }
}

const SVG_TAGS = new Set([
  'svg', 'path', 'g', 'circle', 'line', 'polyline', 'polygon',
  'rect', 'ellipse', 'text', 'tspan', 'defs', 'use', 'clipPath',
  'linearGradient', 'radialGradient', 'stop', 'mask'
]);

class ComponentInstance {
  constructor(vnode, parentDom) {
    this.type = vnode.type;
    this.props = vnode.props;
    this.key = vnode.key;
    this.parentDom = parentDom;
    this.dom = null;
    this.renderedVNode = null;
    this.hooks = [];
    this.pendingEffects = [];
    this.cleanupFunctions = [];
    this.isMounted = false;
  }

  mount() {
    activeInstance = this;
    hookCursor = 0;
    this.pendingEffects = [];

    let childVNode = this.type(this.props);
    activeInstance = null;

    if (childVNode === null || childVNode === undefined || childVNode === false) {
      this.dom = document.createComment('');
      this.isMounted = true;
      return this.dom;
    }

    if (Array.isArray(childVNode)) {
      childVNode = createElement('div', { className: 'react-fragment', style: { display: 'contents' } }, childVNode);
    } else if (typeof childVNode !== 'object') {
      childVNode = createTextElement(childVNode);
    }

    this.renderedVNode = childVNode;
    this.dom = mountVNode(childVNode, this.parentDom);
    this.isMounted = true;

    this.runEffects();
    return this.dom;
  }

  update(newProps) {
    if (newProps) {
      this.props = newProps;
    }

    activeInstance = this;
    hookCursor = 0;
    this.pendingEffects = [];

    let nextVNode = this.type(this.props);
    activeInstance = null;

    if (nextVNode === null || nextVNode === undefined || nextVNode === false) {
      if (this.dom && this.dom.parentNode) {
        const comment = document.createComment('');
        this.dom.parentNode.replaceChild(comment, this.dom);
        this.dom = comment;
      }
      this.renderedVNode = null;
      return;
    }

    if (Array.isArray(nextVNode)) {
      nextVNode = createElement('div', { className: 'react-fragment', style: { display: 'contents' } }, nextVNode);
    } else if (typeof nextVNode !== 'object') {
      nextVNode = createTextElement(nextVNode);
    }

    this.dom = patch(this.parentDom, this.dom, this.renderedVNode, nextVNode);
    this.renderedVNode = nextVNode;

    this.runEffects();
  }

  runEffects() {
    if (this.pendingEffects.length === 0) return;

    const effects = this.pendingEffects;
    this.pendingEffects = [];

    queueMicrotask(() => {
      if (!this.isMounted) return;
      for (const eff of effects) {
        const oldClean = this.cleanupFunctions[eff.hookIndex];
        if (typeof oldClean === 'function') {
          try { oldClean(); } catch (e) { console.error('Error in effect cleanup:', e); }
        }
        try {
          const cleanup = eff.callback();
          this.cleanupFunctions[eff.hookIndex] = cleanup;
          this.hooks[eff.hookIndex] = { deps: eff.deps };
        } catch (e) {
          console.error('Error in effect execution:', e);
        }
      }
    });
  }

  unmount() {
    this.isMounted = false;
    for (const clean of this.cleanupFunctions) {
      if (typeof clean === 'function') {
        try { clean(); } catch (e) { console.error('Error in effect cleanup:', e); }
      }
    }
  }
}

function mountVNode(vnode, container, isSvgContext = false) {
  if (vnode === null || vnode === undefined || vnode === false) {
    return document.createComment('');
  }

  if (Array.isArray(vnode)) {
    const wrapper = createElement('div', { className: 'react-fragment', style: { display: 'contents' } }, vnode);
    return mountVNode(wrapper, container, isSvgContext);
  }

  if (vnode.type === 'TEXT_ELEMENT') {
    const textNode = document.createTextNode(vnode.props.nodeValue);
    vnode._dom = textNode;
    return textNode;
  }

  if (typeof vnode.type === 'function') {
    const inst = new ComponentInstance(vnode, container);
    vnode._instance = inst;
    const dom = inst.mount();
    vnode._dom = dom;
    return dom;
  }

  const isSvg = isSvgContext || SVG_TAGS.has(vnode.type);
  const dom = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', vnode.type)
    : document.createElement(vnode.type);

  vnode._dom = dom;

  // Set properties & listeners
  updateDomProperties(dom, {}, vnode.props, isSvg);

  // Mount children
  const children = Array.isArray(vnode.props.children)
    ? vnode.props.children
    : (vnode.props.children ? [vnode.props.children] : []);

  for (const child of children) {
    const childDom = mountVNode(child, dom, isSvg);
    if (childDom) {
      dom.appendChild(childDom);
    }
  }

  if (vnode.ref) {
    if (typeof vnode.ref === 'function') {
      vnode.ref(dom);
    } else if (typeof vnode.ref === 'object' && vnode.ref !== null) {
      vnode.ref.current = dom;
    }
  }

  return dom;
}

function updateDomProperties(dom, oldProps, newProps, isSvg = false) {
  // Remove deleted attributes
  for (const name in oldProps) {
    if (name === 'children' || name === 'key' || name === 'ref') continue;
    if (!(name in newProps)) {
      if (name.startsWith('on')) {
        const eventType = name.slice(2).toLowerCase();
        if (dom._listeners && dom._listeners[eventType]) {
          dom.removeEventListener(eventType, dom._listeners[eventType]);
          delete dom._listeners[eventType];
        }
      } else if (name === 'className') {
        dom.removeAttribute('class');
      } else if (name === 'style') {
        dom.removeAttribute('style');
      } else if (name === 'value' || name === 'checked') {
        dom[name] = '';
      } else {
        dom.removeAttribute(name);
      }
    }
  }

  // Set new or changed attributes
  for (const name in newProps) {
    if (name === 'children' || name === 'key' || name === 'ref') continue;
    const val = newProps[name];
    const prev = oldProps[name];

    if (val === prev) continue;

    if (name.startsWith('on')) {
      const eventType = name.slice(2).toLowerCase();
      if (!dom._listeners) dom._listeners = {};

      if (dom._listeners[eventType]) {
        dom.removeEventListener(eventType, dom._listeners[eventType]);
      }

      if (val) {
        dom._listeners[eventType] = val;
        dom.addEventListener(eventType, val);
      }
    } else if (name === 'className') {
      if (isSvg) {
        dom.setAttribute('class', val || '');
      } else {
        dom.className = val || '';
      }
    } else if (name === 'style') {
      if (typeof val === 'string') {
        dom.style.cssText = val;
      } else if (typeof val === 'object' && val !== null) {
        dom.style.cssText = '';
        for (const sName in val) {
          dom.style[sName] = val[sName];
        }
      }
    } else if (name === 'dangerouslySetInnerHTML') {
      if (val && val.__html != null) {
        dom.innerHTML = val.__html;
      }
    } else if (name === 'value') {
      if (dom.value !== val) {
        dom.value = val != null ? val : '';
      }
    } else if (name === 'checked') {
      dom.checked = Boolean(val);
    } else if (name === 'disabled') {
      dom.disabled = Boolean(val);
      if (val) dom.setAttribute('disabled', '');
      else dom.removeAttribute('disabled');
    } else {
      if (val === false || val === null || val === undefined) {
        dom.removeAttribute(name);
      } else {
        dom.setAttribute(name, val === true ? '' : String(val));
      }
    }
  }
}

function patch(parentDom, currentDom, oldVNode, newVNode) {
  if (oldVNode === newVNode) {
    return currentDom;
  }

  if (!oldVNode && newVNode) {
    const newDom = mountVNode(newVNode, parentDom);
    if (currentDom && currentDom.parentNode === parentDom) {
      parentDom.insertBefore(newDom, currentDom);
    } else {
      parentDom.appendChild(newDom);
    }
    return newDom;
  }

  if (oldVNode && !newVNode) {
    if (oldVNode._instance) {
      oldVNode._instance.unmount();
    }
    if (currentDom && currentDom.parentNode) {
      currentDom.parentNode.removeChild(currentDom);
    }
    return null;
  }

  if (oldVNode.type !== newVNode.type) {
    const newDom = mountVNode(newVNode, parentDom);
    if (oldVNode._instance) {
      oldVNode._instance.unmount();
    }
    if (currentDom && currentDom.parentNode) {
      currentDom.parentNode.replaceChild(newDom, currentDom);
    }
    return newDom;
  }

  // Handle TEXT_ELEMENT
  if (newVNode.type === 'TEXT_ELEMENT') {
    if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
      currentDom.nodeValue = newVNode.props.nodeValue;
    }
    newVNode._dom = currentDom;
    return currentDom;
  }

  // Handle Component
  if (typeof newVNode.type === 'function') {
    const inst = oldVNode._instance;
    newVNode._instance = inst;
    inst.update(newVNode.props);
    newVNode._dom = inst.dom;
    return inst.dom;
  }

  // Handle HTML / SVG Element
  const isSvg = SVG_TAGS.has(newVNode.type) || (currentDom.namespaceURI && currentDom.namespaceURI.includes('svg'));
  newVNode._dom = currentDom;
  updateDomProperties(currentDom, oldVNode.props, newVNode.props, isSvg);

  // Reconcile children
  const oldChildren = Array.isArray(oldVNode.props.children)
    ? oldVNode.props.children
    : (oldVNode.props.children ? [oldVNode.props.children] : []);

  const newChildren = Array.isArray(newVNode.props.children)
    ? newVNode.props.children
    : (newVNode.props.children ? [newVNode.props.children] : []);

  const maxLength = Math.max(oldChildren.length, newChildren.length);
  const childNodes = Array.from(currentDom.childNodes);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    const existingDom = childNodes[i];

    if (!oldChild && newChild) {
      const childDom = mountVNode(newChild, currentDom, isSvg);
      currentDom.appendChild(childDom);
    } else if (oldChild && !newChild) {
      if (oldChild._instance) oldChild._instance.unmount();
      if (existingDom && existingDom.parentNode === currentDom) {
        currentDom.removeChild(existingDom);
      }
    } else if (oldChild && newChild) {
      patch(currentDom, existingDom, oldChild, newChild);
    }
  }

  return currentDom;
}

export function render(vnode, rootContainer) {
  rootContainer.innerHTML = '';
  const dom = mountVNode(vnode, rootContainer);
  if (dom && dom.parentNode !== rootContainer) {
    rootContainer.appendChild(dom);
  }
  return dom;
}

const React = {
  createElement,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  render
};

export default React;
