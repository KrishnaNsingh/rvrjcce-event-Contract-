// src/core/react.js
var activeInstance = null;
var hookCursor = 0;
var renderQueue = /* @__PURE__ */ new Set();
var isBatching = false;
function createElement(type, props, ...children) {
  props = props || {};
  const flatChildren = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child === null || child === void 0 || child === false || child === true) {
      continue;
    }
    if (Array.isArray(child)) {
      for (let j = 0; j < child.length; j++) {
        const nested = child[j];
        if (nested !== null && nested !== void 0 && nested !== false && nested !== true) {
          flatChildren.push(
            typeof nested === "object" ? nested : createTextElement(nested)
          );
        }
      }
    } else if (typeof child === "object") {
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
    $$typeof: /* @__PURE__ */ Symbol.for("react.element"),
    type,
    props: normalizedProps,
    key: props.key != null ? String(props.key) : null,
    ref: props.ref || null
  };
}
function createTextElement(text) {
  return {
    $$typeof: /* @__PURE__ */ Symbol.for("react.element"),
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(text),
      children: []
    },
    key: null
  };
}
function Fragment(props) {
  return createElement("div", {
    className: "react-fragment",
    style: { display: "contents" }
  }, props ? props.children : null);
}
function useState(initialState) {
  if (!activeInstance) {
    throw new Error("useState must be called inside a component");
  }
  const inst = activeInstance;
  const idx = hookCursor++;
  if (inst.hooks[idx] === void 0) {
    inst.hooks[idx] = typeof initialState === "function" ? initialState() : initialState;
  }
  const setState = (action) => {
    const current = inst.hooks[idx];
    const next = typeof action === "function" ? action(current) : action;
    if (!Object.is(current, next)) {
      inst.hooks[idx] = next;
      scheduleUpdate(inst);
    }
  };
  return [inst.hooks[idx], setState];
}
function useEffect(callback, deps) {
  if (!activeInstance) {
    throw new Error("useEffect must be called inside a component");
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
function useRef(initialValue) {
  if (!activeInstance) {
    throw new Error("useRef must be called inside a component");
  }
  const inst = activeInstance;
  const idx = hookCursor++;
  if (inst.hooks[idx] === void 0) {
    inst.hooks[idx] = { current: initialValue };
  }
  return inst.hooks[idx];
}
function useMemo(factory, deps) {
  if (!activeInstance) {
    throw new Error("useMemo must be called inside a component");
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
function useCallback(callback, deps) {
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
var SVG_TAGS = /* @__PURE__ */ new Set([
  "svg",
  "path",
  "g",
  "circle",
  "line",
  "polyline",
  "polygon",
  "rect",
  "ellipse",
  "text",
  "tspan",
  "defs",
  "use",
  "clipPath",
  "linearGradient",
  "radialGradient",
  "stop",
  "mask"
]);
var ComponentInstance = class {
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
    if (childVNode === null || childVNode === void 0 || childVNode === false) {
      this.dom = document.createComment("");
      this.isMounted = true;
      return this.dom;
    }
    if (Array.isArray(childVNode)) {
      childVNode = createElement("div", { className: "react-fragment", style: { display: "contents" } }, childVNode);
    } else if (typeof childVNode !== "object") {
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
    if (nextVNode === null || nextVNode === void 0 || nextVNode === false) {
      if (this.dom && this.dom.parentNode) {
        const comment = document.createComment("");
        this.dom.parentNode.replaceChild(comment, this.dom);
        this.dom = comment;
      }
      this.renderedVNode = null;
      return;
    }
    if (Array.isArray(nextVNode)) {
      nextVNode = createElement("div", { className: "react-fragment", style: { display: "contents" } }, nextVNode);
    } else if (typeof nextVNode !== "object") {
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
        if (typeof oldClean === "function") {
          try {
            oldClean();
          } catch (e) {
            console.error("Error in effect cleanup:", e);
          }
        }
        try {
          const cleanup = eff.callback();
          this.cleanupFunctions[eff.hookIndex] = cleanup;
          this.hooks[eff.hookIndex] = { deps: eff.deps };
        } catch (e) {
          console.error("Error in effect execution:", e);
        }
      }
    });
  }
  unmount() {
    this.isMounted = false;
    for (const clean of this.cleanupFunctions) {
      if (typeof clean === "function") {
        try {
          clean();
        } catch (e) {
          console.error("Error in effect cleanup:", e);
        }
      }
    }
  }
};
function mountVNode(vnode, container2, isSvgContext = false) {
  if (vnode === null || vnode === void 0 || vnode === false) {
    return document.createComment("");
  }
  if (Array.isArray(vnode)) {
    const wrapper = createElement("div", { className: "react-fragment", style: { display: "contents" } }, vnode);
    return mountVNode(wrapper, container2, isSvgContext);
  }
  if (vnode.type === "TEXT_ELEMENT") {
    const textNode = document.createTextNode(vnode.props.nodeValue);
    vnode._dom = textNode;
    return textNode;
  }
  if (typeof vnode.type === "function") {
    const inst = new ComponentInstance(vnode, container2);
    vnode._instance = inst;
    const dom2 = inst.mount();
    vnode._dom = dom2;
    return dom2;
  }
  const isSvg = isSvgContext || SVG_TAGS.has(vnode.type);
  const dom = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", vnode.type) : document.createElement(vnode.type);
  vnode._dom = dom;
  updateDomProperties(dom, {}, vnode.props, isSvg);
  const children = Array.isArray(vnode.props.children) ? vnode.props.children : vnode.props.children ? [vnode.props.children] : [];
  for (const child of children) {
    const childDom = mountVNode(child, dom, isSvg);
    if (childDom) {
      dom.appendChild(childDom);
    }
  }
  if (vnode.ref) {
    if (typeof vnode.ref === "function") {
      vnode.ref(dom);
    } else if (typeof vnode.ref === "object" && vnode.ref !== null) {
      vnode.ref.current = dom;
    }
  }
  return dom;
}
function updateDomProperties(dom, oldProps, newProps, isSvg = false) {
  for (const name in oldProps) {
    if (name === "children" || name === "key" || name === "ref") continue;
    if (!(name in newProps)) {
      if (name.startsWith("on")) {
        const eventType = name.slice(2).toLowerCase();
        if (dom._listeners && dom._listeners[eventType]) {
          dom.removeEventListener(eventType, dom._listeners[eventType]);
          delete dom._listeners[eventType];
        }
      } else if (name === "className") {
        dom.removeAttribute("class");
      } else if (name === "style") {
        dom.removeAttribute("style");
      } else if (name === "value" || name === "checked") {
        dom[name] = "";
      } else {
        dom.removeAttribute(name);
      }
    }
  }
  for (const name in newProps) {
    if (name === "children" || name === "key" || name === "ref") continue;
    const val = newProps[name];
    const prev = oldProps[name];
    if (val === prev) continue;
    if (name.startsWith("on")) {
      const eventType = name.slice(2).toLowerCase();
      if (!dom._listeners) dom._listeners = {};
      if (dom._listeners[eventType]) {
        dom.removeEventListener(eventType, dom._listeners[eventType]);
      }
      if (val) {
        dom._listeners[eventType] = val;
        dom.addEventListener(eventType, val);
      }
    } else if (name === "className") {
      if (isSvg) {
        dom.setAttribute("class", val || "");
      } else {
        dom.className = val || "";
      }
    } else if (name === "style") {
      if (typeof val === "string") {
        dom.style.cssText = val;
      } else if (typeof val === "object" && val !== null) {
        dom.style.cssText = "";
        for (const sName in val) {
          dom.style[sName] = val[sName];
        }
      }
    } else if (name === "dangerouslySetInnerHTML") {
      if (val && val.__html != null) {
        dom.innerHTML = val.__html;
      }
    } else if (name === "value") {
      if (dom.value !== val) {
        dom.value = val != null ? val : "";
      }
    } else if (name === "checked") {
      dom.checked = Boolean(val);
    } else if (name === "disabled") {
      dom.disabled = Boolean(val);
      if (val) dom.setAttribute("disabled", "");
      else dom.removeAttribute("disabled");
    } else {
      if (val === false || val === null || val === void 0) {
        dom.removeAttribute(name);
      } else {
        dom.setAttribute(name, val === true ? "" : String(val));
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
  if (newVNode.type === "TEXT_ELEMENT") {
    if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
      currentDom.nodeValue = newVNode.props.nodeValue;
    }
    newVNode._dom = currentDom;
    return currentDom;
  }
  if (typeof newVNode.type === "function") {
    const inst = oldVNode._instance;
    newVNode._instance = inst;
    inst.update(newVNode.props);
    newVNode._dom = inst.dom;
    return inst.dom;
  }
  const isSvg = SVG_TAGS.has(newVNode.type) || currentDom.namespaceURI && currentDom.namespaceURI.includes("svg");
  newVNode._dom = currentDom;
  updateDomProperties(currentDom, oldVNode.props, newVNode.props, isSvg);
  const oldChildren = Array.isArray(oldVNode.props.children) ? oldVNode.props.children : oldVNode.props.children ? [oldVNode.props.children] : [];
  const newChildren = Array.isArray(newVNode.props.children) ? newVNode.props.children : newVNode.props.children ? [newVNode.props.children] : [];
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
function render(vnode, rootContainer) {
  rootContainer.innerHTML = "";
  const dom = mountVNode(vnode, rootContainer);
  if (dom && dom.parentNode !== rootContainer) {
    rootContainer.appendChild(dom);
  }
  return dom;
}
var React = {
  createElement,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  render
};
var react_default = React;

// config/eventConfig.js
var INSTITUTION = {
  name: "RVRJCCE",
  fullName: "R.V.R. & J.C. College of Engineering",
  location: "Guntur, Andhra Pradesh",
  accreditation: "Autonomous \u2022 NAAC 'A+' Grade \u2022 NBA Accredited",
  eventTitle: "Inter-College Sports & Cultural Meet 2026",
  eventTagline: "Where Competition Meets Expression.",
  year: "2026"
};
var CATEGORIES = {
  SPORTS: {
    id: "sports",
    name: "Sports",
    tagline: "Compete with purpose.",
    accentColor: "#0E2038",
    // Deep Institutional Navy
    badgeText: "Athletic Arena",
    number: "01",
    description: "High-intensity collegiate sports tournaments testing endurance, tactical precision, and athletic teamwork across dedicated championship facilities."
  },
  CULTURAL: {
    id: "cultural",
    name: "Literary & Cultural",
    tagline: "Expression takes many forms.",
    accentColor: "#9E472A",
    // Warm Terracotta Ochre
    badgeText: "Creative Stage",
    number: "02",
    description: "A celebration of vocal mastery, choreography, dramatics, fine arts, runway fashion, and literary eloquence representing collegiate talent."
  }
};
var SPORTS_DIVISIONS = {
  BOYS: {
    id: "boys",
    label: "Boys Division",
    shortLabel: "Boys",
    events: [
      {
        id: "sports-boys-basketball",
        name: "Basketball",
        category: "sports",
        division: "Boys",
        format: "Team (5 + 5 Substitutes)",
        venueType: "Standard Hardcourt Arena",
        duration: "4 Quarters \xD7 10 Mins",
        equipment: "Official FIBA Size 7 Balls provided",
        rules: "Knockout tournament rules apply. Standard FIBA timing and foul regulations. Team jerseys with visible uniform numbers required.",
        shortDescription: "Full-court collegiate tournament testing tactical transitions, perimeter marksmanship, and paint defense.",
        keyAttributes: ["Full Court", "Knockout Bracket", "Team Championship"]
      },
      {
        id: "sports-boys-volleyball",
        name: "Volleyball",
        category: "sports",
        division: "Boys",
        format: "Team (6 + 6 Substitutes)",
        venueType: "Outdoor Clay / Synthetic Court",
        duration: "Best of 3 Sets (Finals: Best of 5)",
        equipment: "Standard tournament net & balls",
        rules: "FIVB standard rules. Libero rotation permitted. Non-marking shoes or sports footwear mandatory.",
        shortDescription: "High-velocity spikes, athletic blocks, and disciplined rally defense in a competitive inter-college bracket.",
        keyAttributes: ["Rally Point System", "Libero Eligible", "Team Championship"]
      },
      {
        id: "sports-boys-table-tennis",
        name: "Table Tennis",
        category: "sports",
        division: "Boys",
        format: "Singles & Doubles",
        venueType: "Indoor Sports Complex",
        duration: "Best of 5 Games (11 points per game)",
        equipment: "ITTF approved 3-star 40+ plastic balls",
        rules: "ITTF rules governing legal service tosses and racket coverings. Players must bring standard rubber paddles.",
        shortDescription: "Fast-reflex indoor table tennis championship featuring sharp backhand counters and offensive spin play.",
        keyAttributes: ["Singles / Doubles", "Indoor Complex", "Individual & Pairs"]
      }
    ]
  },
  GIRLS: {
    id: "girls",
    label: "Girls Division",
    shortLabel: "Girls",
    events: [
      {
        id: "sports-girls-throwball",
        name: "Throwball",
        category: "sports",
        division: "Girls",
        format: "Team (7 + 5 Substitutes)",
        venueType: "Standard Throwball Court",
        duration: "Best of 3 Sets (25 points rally)",
        equipment: "Official Throwball Federation match balls",
        rules: "Two-handed catching and single-handed overhead release within 3 seconds. Crossing service line prohibited.",
        shortDescription: "Dynamic, fast-paced court battle emphasizing spatial awareness, catching agility, and swift offensive throws.",
        keyAttributes: ["7-Player Team", "Rally Scoring", "Team Championship"]
      },
      {
        id: "sports-girls-tennis",
        name: "Tennis",
        category: "sports",
        division: "Girls",
        format: "Singles & Doubles",
        venueType: "Championship Tennis Courts",
        duration: "Pro-set / Best of 3 Sets with tiebreak",
        equipment: "All-court pressurized balls provided",
        rules: "ITF tournament rules. Proper tennis attire and court shoes required. Deuce with advantage play.",
        shortDescription: "Baseline rallies, disciplined serve-and-volley exchanges, and cross-court winners in premier tennis brackets.",
        keyAttributes: ["Singles & Doubles", "Championship Courts", "Individual & Pairs"]
      },
      {
        id: "sports-girls-table-tennis",
        name: "Table Tennis",
        category: "sports",
        division: "Girls",
        format: "Singles & Doubles",
        venueType: "Indoor Sports Complex",
        duration: "Best of 5 Games (11 points per game)",
        equipment: "ITTF approved 3-star 40+ plastic balls",
        rules: "Standard ITTF scoring. Legal 6-inch toss on serves. Uniform sportswear mandatory.",
        shortDescription: "Indoor precision tournament showcasing swift footwork, loop drives, and disciplined defensive chopping.",
        keyAttributes: ["Singles / Doubles", "Indoor Complex", "Individual & Pairs"]
      }
    ]
  }
};
var CULTURAL_EVENTS = [
  {
    id: "cultural-fine-arts",
    number: "01",
    name: "Fine Arts",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Visual Arts",
    format: "Individual Competition",
    duration: "2.5 Hours",
    disciplines: ["Spot Painting", "Sketching & Charcoal", "Clay Modeling", "Poster Art"],
    shortDescription: "A test of visual imagination, composition, and brush technique responding to live thematic prompts.",
    guidelines: "Drawing sheets and basic clay provided. Artists must bring personal brushes, paints, charcoals, and sculpting implements."
  },
  {
    id: "cultural-music-band",
    number: "02",
    name: "Music & Band",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Vocal & Instrumental",
    subEvents: ["Solo", "Group"],
    format: "Solo (Vocals/Instrumental) / Band (3-8 Members)",
    duration: "Solo: 5 Mins | Group: 10 Mins (+ setup)",
    disciplines: ["Indian Classical Vocal", "Western Solo", "Eastern Classical Instrumental", "Battle of the Bands"],
    shortDescription: "Vocal harmonies and instrumental dexterity spanning classical ragas, contemporary acoustic sets, and full rock bands.",
    guidelines: "Drum kit and stage sound system provided. Performers bring personal guitars, keyboards, violins, and brass instruments."
  },
  {
    id: "cultural-dance",
    number: "03",
    name: "Dance",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Performing Arts",
    subEvents: ["Solo", "Group"],
    format: "Solo (4 Mins) / Group (6-16 Members, 8 Mins)",
    duration: "4 - 8 Minutes",
    disciplines: ["Classical (Kuchipudi/Bharatanatyam)", "Folk Dance", "Western Freestyle", "Hip-Hop Choreography"],
    shortDescription: "Rhythmic expression celebrating Indian classical heritage, folk traditions, and high-energy contemporary crew dance.",
    guidelines: "Audio track in high-definition MP3 must be submitted to audio console 2 hours prior to stage call. Safe props permitted."
  },
  {
    id: "cultural-choreoday",
    number: "04",
    name: "Choreoday",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Thematic Stage Production",
    subEvents: ["Theme Based"],
    format: "Large Ensemble (12-25 Performers)",
    duration: "10 - 14 Minutes",
    disciplines: ["Thematic Narrative", "Social Relevance", "Historical Epic", "Experimental Movement"],
    shortDescription: "Flagship theatrical choreography where student troupes weave storytelling, cinematic music, and synchronized movement around a central social or cultural theme.",
    guidelines: "Original narrative synopsis required at reporting. Maximum 3 minutes for stage preparation and prop placement."
  },
  {
    id: "cultural-dramatics",
    number: "05",
    name: "Dramatics",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Theatre & Street Play",
    format: "One-Act Play (Up to 12 actors) / Street Play / Monologue",
    duration: "One-Act: 20 Mins | Street Play: 12 Mins | Mono: 4 Mins",
    disciplines: ["One-Act Stage Play", "Nukkad Natak (Street Play)", "Dramatic Monologue", "Mime"],
    shortDescription: "A showcase of raw stage presence, vocal projection, comedic timing, and emotional resonance exploring contemporary social issues.",
    guidelines: "Original scripts or credited adaptations accepted. Script copy must be handed to jury during technical briefing."
  },
  {
    id: "cultural-fashion-show",
    number: "06",
    name: "Fashion Show",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Runway & Styling",
    format: "Team Ensemble (10-18 Models + Stylists)",
    duration: "10 - 12 Minutes on runway",
    disciplines: ["Ethno-Futurism", "Sustainable Handlooms", "Avante-Garde Conceptual", "Heritage Textiles of India"],
    shortDescription: "An editorial runway event exploring sustainable fashion, traditional weaves of Andhra Pradesh, and avant-garde campus styling.",
    guidelines: "No vulgarity or inappropriate costume designs permitted. Emphasis placed on theme coherence, choreography, and garment craft."
  },
  {
    id: "cultural-tekraft",
    number: "07",
    name: "Tekraft Events",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Creative Tech & Craft",
    format: "Individual or Pairs",
    duration: "3 Hours / Scheduled Submissions",
    disciplines: ["Digital Motion Graphics", "Short Film / Reel Craft", "Creative UI/UX Prototype", "Generative Graphic Design"],
    shortDescription: "Where engineering skill meets digital aesthetics: technical art, cinematic storytelling, and multimedia creative craft.",
    guidelines: "Assets created during competition hours. Hardware/laptops must be brought by participants. Prompts disclosed at start."
  },
  {
    id: "cultural-literary",
    number: "08",
    name: "Literary",
    category: "cultural",
    division: "Cultural / Open",
    subCategory: "Oratory & Wordcraft",
    format: "Individual / Parliamentary Debate Teams (2-3)",
    duration: "Various rounds (Debate: 4 Mins per speaker)",
    disciplines: ["Parliamentary Debate", "Elocution", "Creative Writing (English/Telugu)", "General & Literary Quiz"],
    shortDescription: "Intellectual sparring, eloquent oratory, persuasive argumentation, and nuanced creative prose across multilingual disciplines.",
    guidelines: "Topics for extempore and debate announced with 10-minute prep time. Clean collegiate discourse and rebuttal rules observed."
  }
];

// src/components/Navbar.jsx
function Navbar({ currentRoute, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleNavClick = (route, sectionId = null) => {
    setMobileMenuOpen(false);
    onNavigate(route);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ react_default.createElement("header", { className: `site-nav ${isScrolled ? "scrolled" : ""}` }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "nav-inner" }, /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "nav-brand",
      style: { cursor: "pointer" },
      onClick: () => handleNavClick("home")
    },
    /* @__PURE__ */ react_default.createElement("div", { className: "brand-crest" }, /* @__PURE__ */ react_default.createElement("span", null, "RVR")),
    /* @__PURE__ */ react_default.createElement("div", { className: "brand-text" }, /* @__PURE__ */ react_default.createElement("span", { className: "brand-title" }, INSTITUTION.name), /* @__PURE__ */ react_default.createElement("span", { className: "brand-subtitle" }, "Andhra Pradesh"))
  ), /* @__PURE__ */ react_default.createElement("nav", { className: "nav-links" }, /* @__PURE__ */ react_default.createElement(
    "a",
    {
      className: `nav-link ${currentRoute === "home" ? "active" : ""}`,
      onClick: () => handleNavClick("home")
    },
    "Home"
  ), /* @__PURE__ */ react_default.createElement(
    "a",
    {
      className: "nav-link",
      onClick: () => handleNavClick("home", "sports-section")
    },
    "Sports"
  ), /* @__PURE__ */ react_default.createElement(
    "a",
    {
      className: "nav-link",
      onClick: () => handleNavClick("home", "cultural-section")
    },
    "Literary & Cultural"
  ), /* @__PURE__ */ react_default.createElement(
    "a",
    {
      className: "nav-link",
      onClick: () => handleNavClick("home", "discovery-section")
    },
    "Events"
  ), /* @__PURE__ */ react_default.createElement(
    "a",
    {
      className: `nav-link ${currentRoute === "register" ? "active" : ""}`,
      onClick: () => handleNavClick("register")
    },
    "Register"
  ), /* @__PURE__ */ react_default.createElement(
    "a",
    {
      className: `nav-link ${currentRoute === "admin" ? "active" : ""}`,
      onClick: () => handleNavClick("admin"),
      style: { fontSize: "0.8125rem", color: "var(--text-muted)" }
    },
    "Admin Portal"
  )), /* @__PURE__ */ react_default.createElement("div", { className: "nav-actions" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-primary btn-sm",
      onClick: () => handleNavClick("register")
    },
    "Register Now"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "mobile-menu-btn",
      onClick: () => setMobileMenuOpen(!mobileMenuOpen),
      "aria-label": "Toggle navigation menu"
    },
    /* @__PURE__ */ react_default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, mobileMenuOpen ? /* @__PURE__ */ react_default.createElement("path", { d: "M18 6L6 18M6 6l12 12" }) : /* @__PURE__ */ react_default.createElement("path", { d: "M4 6h16M4 12h16M4 18h16" }))
  )))), /* @__PURE__ */ react_default.createElement("div", { className: `mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}` }, /* @__PURE__ */ react_default.createElement("a", { className: "mobile-nav-link", onClick: () => handleNavClick("home") }, "Home"), /* @__PURE__ */ react_default.createElement("a", { className: "mobile-nav-link", onClick: () => handleNavClick("home", "sports-section") }, "Sports (Boys & Girls)"), /* @__PURE__ */ react_default.createElement("a", { className: "mobile-nav-link", onClick: () => handleNavClick("home", "cultural-section") }, "Literary & Cultural"), /* @__PURE__ */ react_default.createElement("a", { className: "mobile-nav-link", onClick: () => handleNavClick("home", "discovery-section") }, "Events Overview"), /* @__PURE__ */ react_default.createElement("a", { className: "mobile-nav-link", onClick: () => handleNavClick("register") }, "Event Registration"), /* @__PURE__ */ react_default.createElement("a", { className: "mobile-nav-link", onClick: () => handleNavClick("admin") }, "Admin Portal"), /* @__PURE__ */ react_default.createElement("div", { style: { marginTop: "1.25rem" } }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-primary",
      style: { width: "100%" },
      onClick: () => handleNavClick("register")
    },
    "Register Now"
  ))));
}

// src/components/Hero.jsx
function Hero({ onExploreEvents, onRegisterClick }) {
  return /* @__PURE__ */ react_default.createElement("section", { className: "hero-section" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "hero-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "hero-content" }, /* @__PURE__ */ react_default.createElement("div", { className: "hero-eyebrow" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow", style: { marginBottom: 0 } }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "RVRJCCE \u2022 ANDHRA PRADESH"), /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-navy" }, "Annual Meet 2026")), /* @__PURE__ */ react_default.createElement("h1", { className: "heading-display hero-title" }, "Where ", /* @__PURE__ */ react_default.createElement("em", null, "Competition"), " Meets ", /* @__PURE__ */ react_default.createElement("em", null, "Expression"), "."), /* @__PURE__ */ react_default.createElement("p", { className: "text-lead hero-copy" }, "A university platform bringing together students through high-intensity sports, literature, fine arts, music, dance, dramatics, fashion, and cultural competitions. Designed for grit, creative audacity, and inter-collegiate camaraderie."), /* @__PURE__ */ react_default.createElement("div", { className: "hero-ctas" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-primary btn-lg",
      onClick: onExploreEvents
    },
    /* @__PURE__ */ react_default.createElement("span", null, "Explore Events"),
    /* @__PURE__ */ react_default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" }))
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary btn-lg",
      onClick: onRegisterClick
    },
    /* @__PURE__ */ react_default.createElement("span", null, "Register Now")
  )), /* @__PURE__ */ react_default.createElement("div", { className: "hero-micro-details" }, /* @__PURE__ */ react_default.createElement("span", null, "SPORTS"), /* @__PURE__ */ react_default.createElement("span", { className: "hero-micro-divider" }), /* @__PURE__ */ react_default.createElement("span", null, "LITERARY"), /* @__PURE__ */ react_default.createElement("span", { className: "hero-micro-divider" }), /* @__PURE__ */ react_default.createElement("span", null, "CULTURAL"))), /* @__PURE__ */ react_default.createElement("div", { className: "hero-visual-frame" }, /* @__PURE__ */ react_default.createElement("div", { className: "hero-visual-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell visual-cell-sports" }, /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell-tag" }, /* @__PURE__ */ react_default.createElement("span", null, "01 \u2022 ATHLETIC ARENA"), /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-navy", style: { fontSize: "0.625rem" } }, "COURT / FIELD")), /* @__PURE__ */ react_default.createElement("div", { style: { margin: "auto 0", textAlign: "center" } }, /* @__PURE__ */ react_default.createElement("svg", { width: "100%", height: "110", viewBox: "0 0 200 110", fill: "none", style: { opacity: 0.85 } }, /* @__PURE__ */ react_default.createElement("rect", { x: "10", y: "10", width: "180", height: "90", rx: "3", stroke: "#0E223D", strokeWidth: "1.5", fill: "#F4F8FB" }), /* @__PURE__ */ react_default.createElement("line", { x1: "100", y1: "10", x2: "100", y2: "100", stroke: "#0E223D", strokeWidth: "1.5" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "100", cy: "55", r: "22", stroke: "#0E223D", strokeWidth: "1.5", fill: "none" }), /* @__PURE__ */ react_default.createElement("path", { d: "M10 32.5 h35 a22.5 22.5 0 0 1 0 45 h-35", stroke: "#0E223D", strokeWidth: "1.5", fill: "none" }), /* @__PURE__ */ react_default.createElement("path", { d: "M190 32.5 h-35 a22.5 22.5 0 0 0 0 45 h35", stroke: "#0E223D", strokeWidth: "1.5", fill: "none" }), /* @__PURE__ */ react_default.createElement("path", { d: "M35 80 Q 95 10 165 45", stroke: "#9E472A", strokeWidth: "2", strokeDasharray: "3 3", fill: "none" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "165", cy: "45", r: "4.5", fill: "#9E472A" }))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell-caption" }, "Hardcourt Agility & Rally Spirit"), /* @__PURE__ */ react_default.createElement("div", { style: { fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" } }, "Basketball \u2022 Volleyball \u2022 Tennis \u2022 Table Tennis"))), /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell visual-cell-arts" }, /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell-tag" }, /* @__PURE__ */ react_default.createElement("span", { style: { color: "var(--accent-cultural)" } }, "02 \u2022 VISUAL ARTS"), /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-terracotta", style: { fontSize: "0.625rem" } }, "STUDIO")), /* @__PURE__ */ react_default.createElement("div", { style: { margin: "auto 0" } }, /* @__PURE__ */ react_default.createElement("svg", { width: "100%", height: "60", viewBox: "0 0 180 60", fill: "none", style: { opacity: 0.9 } }, /* @__PURE__ */ react_default.createElement("path", { d: "M20 45 C 50 15, 80 50, 110 20 C 130 5, 150 35, 170 15", stroke: "#9E472A", strokeWidth: "2.5", strokeLinecap: "round", fill: "none" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "20", cy: "45", r: "3", fill: "#9E472A" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "110", cy: "20", r: "3", fill: "#9E472A" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "170", cy: "15", r: "3", fill: "#9E472A" }))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { style: { fontFamily: "var(--font-serif)", fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)" } }, "Canvas & Brushcraft"), /* @__PURE__ */ react_default.createElement("div", { style: { fontSize: "0.6875rem", color: "var(--text-muted)" } }, "Fine Arts \u2022 Tekraft Media"))), /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell visual-cell-stage" }, /* @__PURE__ */ react_default.createElement("div", { className: "visual-cell-tag" }, /* @__PURE__ */ react_default.createElement("span", null, "03 \u2022 AUDITORIUM"), /* @__PURE__ */ react_default.createElement("span", { className: "badge", style: { fontSize: "0.625rem" } }, "STAGE")), /* @__PURE__ */ react_default.createElement("div", { style: { margin: "auto 0" } }, /* @__PURE__ */ react_default.createElement("svg", { width: "100%", height: "45", viewBox: "0 0 180 45", fill: "none", style: { opacity: 0.85 } }, /* @__PURE__ */ react_default.createElement("path", { d: "M15 35 Q 90 5 165 35", stroke: "#0E223D", strokeWidth: "1.5", fill: "none" }), /* @__PURE__ */ react_default.createElement("line", { x1: "30", y1: "33", x2: "30", y2: "40", stroke: "#0E223D", strokeWidth: "1" }), /* @__PURE__ */ react_default.createElement("line", { x1: "60", y1: "23", x2: "60", y2: "40", stroke: "#0E223D", strokeWidth: "1" }), /* @__PURE__ */ react_default.createElement("line", { x1: "90", y1: "19", x2: "90", y2: "40", stroke: "#0E223D", strokeWidth: "1" }), /* @__PURE__ */ react_default.createElement("line", { x1: "120", y1: "23", x2: "120", y2: "40", stroke: "#0E223D", strokeWidth: "1" }), /* @__PURE__ */ react_default.createElement("line", { x1: "150", y1: "33", x2: "150", y2: "40", stroke: "#0E223D", strokeWidth: "1" }))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { style: { fontFamily: "var(--font-serif)", fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)" } }, "Stage & Soundwaves"), /* @__PURE__ */ react_default.createElement("div", { style: { fontSize: "0.6875rem", color: "var(--text-muted)" } }, "Choreoday \u2022 Band \u2022 Dramatics")))), /* @__PURE__ */ react_default.createElement("div", { className: "hero-stamp-badge" }, /* @__PURE__ */ react_default.createElement("span", null, INSTITUTION.name, " \u2022 2026"))))));
}

// src/components/IntroSection.jsx
function IntroSection({ liveStats }) {
  const eventsCount = "XX+ Events";
  const participantsCount = liveStats && liveStats.total ? `${liveStats.total}+ Registered` : "XX+ Participants";
  const daysCount = "XX Days";
  const venuesCount = "XX Venues";
  return /* @__PURE__ */ react_default.createElement("section", { className: "section-wrapper intro-section", id: "intro-section" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "intro-grid" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "INSTITUTIONAL ETHOS"), /* @__PURE__ */ react_default.createElement("h2", { className: "intro-statement" }, "An event built for participation.")), /* @__PURE__ */ react_default.createElement("div", { className: "intro-paragraphs" }, /* @__PURE__ */ react_default.createElement("p", { className: "text-body", style: { fontSize: "1.0625rem" } }, "At ", INSTITUTION.fullName, ", athletic rigor and cultural inquiry stand as complementary pillars of student formation. This annual inter-college championship unites collegiate teams from across the state in a shared arena of sportsmanship, creative expression, and intellectual vitality."), /* @__PURE__ */ react_default.createElement("p", { className: "text-caption" }, "Competitions are structured with accredited refereeing, jury-moderated cultural stages, and verified inter-collegiate eligibility protocols."))), /* @__PURE__ */ react_default.createElement("div", { className: "stats-strip" }, /* @__PURE__ */ react_default.createElement("div", { className: "stat-item" }, /* @__PURE__ */ react_default.createElement("span", { className: "stat-value" }, eventsCount), /* @__PURE__ */ react_default.createElement("span", { className: "stat-label" }, "Competitions"), /* @__PURE__ */ react_default.createElement("span", { className: "stat-footnote" }, "* Dynamic database placeholder")), /* @__PURE__ */ react_default.createElement("div", { className: "stat-item" }, /* @__PURE__ */ react_default.createElement("span", { className: "stat-value" }, participantsCount), /* @__PURE__ */ react_default.createElement("span", { className: "stat-label" }, "Student Entries"), /* @__PURE__ */ react_default.createElement("span", { className: "stat-footnote" }, "* Live sync with MongoDB registrations")), /* @__PURE__ */ react_default.createElement("div", { className: "stat-item stat-item-cultural" }, /* @__PURE__ */ react_default.createElement("span", { className: "stat-value" }, daysCount), /* @__PURE__ */ react_default.createElement("span", { className: "stat-label" }, "Championship Duration"), /* @__PURE__ */ react_default.createElement("span", { className: "stat-footnote" }, "* Schedule placeholder pending university notification")), /* @__PURE__ */ react_default.createElement("div", { className: "stat-item stat-item-cultural" }, /* @__PURE__ */ react_default.createElement("span", { className: "stat-value" }, venuesCount), /* @__PURE__ */ react_default.createElement("span", { className: "stat-label" }, "Dedicated Grounds"), /* @__PURE__ */ react_default.createElement("span", { className: "stat-footnote" }, "* Courts & auditorium facilities")))));
}

// src/components/EventDiscovery.jsx
function EventDiscovery({ onSelectCategory }) {
  return /* @__PURE__ */ react_default.createElement("section", { className: "section-wrapper discovery-section", id: "discovery-section" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "section-header-editorial" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "TWO DISCIPLINES \u2022 ONE STAGE"), /* @__PURE__ */ react_default.createElement("h2", { className: "heading-section" }, "Event Architecture")), /* @__PURE__ */ react_default.createElement("p", { className: "text-body", style: { maxWidth: "460px" } }, "Choose between competitive inter-collegiate sports brackets or our expansive literary, dramatic, musical, and visual arts competitions.")), /* @__PURE__ */ react_default.createElement("div", { className: "discovery-pillars" }, /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "discovery-card discovery-card-sports",
      onClick: () => onSelectCategory("sports")
    },
    /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "pillar-number" }, "01 / CATEGORY"), /* @__PURE__ */ react_default.createElement("h3", { className: "pillar-title" }, "Sports Championship"), /* @__PURE__ */ react_default.createElement("div", { className: "pillar-tagline sports" }, CATEGORIES.SPORTS.tagline), /* @__PURE__ */ react_default.createElement("p", { className: "pillar-desc" }, "High-stakes athletic tournaments across Basketball, Volleyball, Throwball, Lawn Tennis, and Table Tennis, segmented into dedicated Boys and Girls divisions."), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" } }, /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-navy" }, "Boys: Basketball \u2022 Volleyball \u2022 Table Tennis"), /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-navy" }, "Girls: Throwball \u2022 Tennis \u2022 Table Tennis"))),
    /* @__PURE__ */ react_default.createElement("div", { className: "pillar-footer" }, /* @__PURE__ */ react_default.createElement("span", { className: "text-caption" }, "Official refereeing & tournament brackets"), /* @__PURE__ */ react_default.createElement("span", { className: "pillar-link" }, /* @__PURE__ */ react_default.createElement("span", null, "View Sports Fixtures"), /* @__PURE__ */ react_default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" }))))
  ), /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "discovery-card discovery-card-cultural",
      onClick: () => onSelectCategory("cultural")
    },
    /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "pillar-number", style: { color: "var(--accent-cultural)" } }, "02 / CATEGORY"), /* @__PURE__ */ react_default.createElement("h3", { className: "pillar-title" }, "Literary & Cultural"), /* @__PURE__ */ react_default.createElement("div", { className: "pillar-tagline cultural" }, CATEGORIES.CULTURAL.tagline), /* @__PURE__ */ react_default.createElement("p", { className: "pillar-desc" }, "Eight curated creative categories spanning Fine Arts, Music & Band, Solo & Crew Dance, thematic Choreoday, Dramatics, Runway Fashion, Tekraft multimedia, and Literary debates."), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" } }, /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-terracotta" }, "Fine Arts \u2022 Music & Band \u2022 Dance"), /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-terracotta" }, "Choreoday \u2022 Dramatics \u2022 Fashion \u2022 Literary"))),
    /* @__PURE__ */ react_default.createElement("div", { className: "pillar-footer" }, /* @__PURE__ */ react_default.createElement("span", { className: "text-caption" }, "Jury evaluated & auditorium showcases"), /* @__PURE__ */ react_default.createElement("span", { className: "pillar-link", style: { color: "var(--accent-cultural)" } }, /* @__PURE__ */ react_default.createElement("span", null, "Explore Cultural Categories"), /* @__PURE__ */ react_default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" }))))
  ))));
}

// src/components/SportsSection.jsx
function SportsSection({ onRegisterEvent }) {
  const [activeDivision, setActiveDivision] = useState("all");
  const boysEvents = SPORTS_DIVISIONS.BOYS.events;
  const girlsEvents = SPORTS_DIVISIONS.GIRLS.events;
  const displayedEvents = activeDivision === "boys" ? boysEvents : activeDivision === "girls" ? girlsEvents : [...boysEvents, ...girlsEvents];
  return /* @__PURE__ */ react_default.createElement("section", { className: "section-wrapper sports-section", id: "sports-section" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "section-header-editorial" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "ATHLETIC EXCELLENCE \u2022 01"), /* @__PURE__ */ react_default.createElement("h2", { className: "heading-section" }, "Compete with purpose.")), /* @__PURE__ */ react_default.createElement("div", { className: "division-tabs" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: `division-tab ${activeDivision === "all" ? "active" : ""}`,
      onClick: () => setActiveDivision("all")
    },
    "All Sports (",
    boysEvents.length + girlsEvents.length,
    ")"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: `division-tab ${activeDivision === "boys" ? "active" : ""}`,
      onClick: () => setActiveDivision("boys")
    },
    "Boys Division (",
    boysEvents.length,
    ")"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: `division-tab ${activeDivision === "girls" ? "active" : ""}`,
      onClick: () => setActiveDivision("girls")
    },
    "Girls Division (",
    girlsEvents.length,
    ")"
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "sports-grid" }, displayedEvents.map((evt) => /* @__PURE__ */ react_default.createElement("div", { key: `${evt.division}-${evt.id}`, className: "sport-card" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "sport-card-header" }, /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-navy" }, evt.division, " Division"), /* @__PURE__ */ react_default.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" } }, evt.format)), /* @__PURE__ */ react_default.createElement("h3", { className: "sport-name" }, evt.name), /* @__PURE__ */ react_default.createElement("p", { className: "sport-desc" }, evt.shortDescription), /* @__PURE__ */ react_default.createElement("div", { className: "sport-meta-list" }, /* @__PURE__ */ react_default.createElement("div", { className: "sport-meta-row" }, /* @__PURE__ */ react_default.createElement("span", null, "Venue Type:"), /* @__PURE__ */ react_default.createElement("strong", { style: { color: "var(--text-primary)" } }, evt.venueType)), /* @__PURE__ */ react_default.createElement("div", { className: "sport-meta-row" }, /* @__PURE__ */ react_default.createElement("span", null, "Match Format:"), /* @__PURE__ */ react_default.createElement("span", null, evt.duration)), /* @__PURE__ */ react_default.createElement("div", { className: "sport-meta-row" }, /* @__PURE__ */ react_default.createElement("span", null, "Tournament Mode:"), /* @__PURE__ */ react_default.createElement("span", null, "Knockout Bracket"))), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1.25rem" } }, evt.keyAttributes.map((attr, idx) => /* @__PURE__ */ react_default.createElement("span", { key: idx, className: "badge badge-outline", style: { fontSize: "0.6875rem" } }, attr)))), /* @__PURE__ */ react_default.createElement("div", { className: "sport-card-footer" }, /* @__PURE__ */ react_default.createElement("span", { className: "text-caption" }, "Open Inter-College"), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      onClick: () => onRegisterEvent("Sports", evt.division, evt.name)
    },
    /* @__PURE__ */ react_default.createElement("span", null, "Register Entry"),
    /* @__PURE__ */ react_default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" }))
  )))))));
}

// src/components/LiteraryCulturalSection.jsx
function LiteraryCulturalSection({ onRegisterEvent }) {
  const [expandedId, setExpandedId] = useState(null);
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  return /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement("section", { className: "transition-strip" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "transition-inner" }, /* @__PURE__ */ react_default.createElement("div", { className: "transition-quote" }, '"From court discipline to the boundless possibilities of the stage \u2014 inter-collegiate brilliance defined through athletic precision and creative audacity."'), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.75rem", alignItems: "center" } }, /* @__PURE__ */ react_default.createElement("span", { className: "badge badge-outline" }, "TRANSITION"), /* @__PURE__ */ react_default.createElement("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" } }, "SPORTS \u2192 CULTURAL"))))), /* @__PURE__ */ react_default.createElement("section", { className: "section-wrapper cultural-section", id: "cultural-section" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "section-header-editorial" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow eyebrow-cultural" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "CREATIVE EXPRESSION \u2022 02"), /* @__PURE__ */ react_default.createElement("h2", { className: "heading-section" }, "LITERARY & CULTURAL"), /* @__PURE__ */ react_default.createElement("div", { style: { fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontStyle: "italic", color: "var(--accent-cultural)", marginTop: "0.25rem" } }, "Expression takes many forms.")), /* @__PURE__ */ react_default.createElement("p", { className: "text-body", style: { maxWidth: "440px" } }, "Eight distinct disciplines celebrating Indian classical heritage, contemporary theatre, experimental dance choreography, runway styling, digital craft, and forensic debate.")), /* @__PURE__ */ react_default.createElement("div", { className: "cultural-magazine-layout" }, CULTURAL_EVENTS.map((item) => {
    const isExpanded = expandedId === item.id;
    return /* @__PURE__ */ react_default.createElement("div", { key: item.id, className: "cultural-row" }, /* @__PURE__ */ react_default.createElement("div", { className: "cultural-row-num" }, item.number), /* @__PURE__ */ react_default.createElement("div", { className: "cultural-row-title-area" }, /* @__PURE__ */ react_default.createElement("h3", { className: "cultural-row-name" }, item.name), /* @__PURE__ */ react_default.createElement("span", { className: "cultural-row-sub" }, item.subCategory), item.subEvents && /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.375rem", marginTop: "0.375rem" } }, item.subEvents.map((sub, sIdx) => /* @__PURE__ */ react_default.createElement(
      "span",
      {
        key: sIdx,
        className: "badge badge-terracotta",
        style: { fontSize: "0.625rem", padding: "0.125rem 0.375rem" }
      },
      sub.toUpperCase()
    )))), /* @__PURE__ */ react_default.createElement("div", { className: "cultural-row-details" }, /* @__PURE__ */ react_default.createElement("p", { className: "cultural-row-desc" }, item.shortDescription), /* @__PURE__ */ react_default.createElement("div", { className: "cultural-disciplines" }, item.disciplines.map((d, dIdx) => /* @__PURE__ */ react_default.createElement("span", { key: dIdx, className: "discipline-pill" }, d))), isExpanded && /* @__PURE__ */ react_default.createElement("div", { style: {
      marginTop: "0.875rem",
      padding: "0.875rem",
      backgroundColor: "var(--bg-subtle)",
      borderRadius: "var(--radius-sm)",
      fontSize: "0.8125rem"
    } }, /* @__PURE__ */ react_default.createElement("div", { style: { fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" } }, "Guidelines & Stage Technicals:"), /* @__PURE__ */ react_default.createElement("div", { style: { color: "var(--text-secondary)", lineHeight: 1.5 } }, item.guidelines), /* @__PURE__ */ react_default.createElement("div", { style: { marginTop: "0.375rem", color: "var(--text-muted)", fontSize: "0.75rem" } }, "Format: ", item.format, " \u2022 Allocation: ", item.duration))), /* @__PURE__ */ react_default.createElement("div", { className: "cultural-row-actions" }, /* @__PURE__ */ react_default.createElement(
      "button",
      {
        className: "btn btn-cultural btn-sm",
        style: { width: "100%" },
        onClick: () => onRegisterEvent("Literary & Cultural", "Cultural / Open", item.name)
      },
      /* @__PURE__ */ react_default.createElement("span", null, "Register for ", item.name)
    ), /* @__PURE__ */ react_default.createElement(
      "button",
      {
        style: {
          background: "none",
          border: "none",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0"
        },
        onClick: () => toggleExpand(item.id)
      },
      /* @__PURE__ */ react_default.createElement("span", null, isExpanded ? "Hide Guidelines" : "Rules & Guidelines"),
      /* @__PURE__ */ react_default.createElement(
        "svg",
        {
          width: "12",
          height: "12",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          style: { transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }
        },
        /* @__PURE__ */ react_default.createElement("path", { d: "M6 9l6 6 6-6" })
      )
    )));
  })))));
}

// src/components/FeaturedArena.jsx
function FeaturedArena({ onSelectCategory, onRegisterClick }) {
  return /* @__PURE__ */ react_default.createElement("section", { className: "section-wrapper featured-arena-section", id: "featured-arena" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { style: { textAlign: "center", maxWidth: "640px", margin: "0 auto 3.5rem" } }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow", style: { justifyContent: "center" } }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "DISCIPLINE SELECTOR"), /* @__PURE__ */ react_default.createElement("h2", { className: "heading-section", style: { marginBottom: "0.75rem" } }, "Choose your arena."), /* @__PURE__ */ react_default.createElement("p", { className: "text-body" }, "Whether your talent thrives on the high-intensity court or beneath the auditorium spotlight, find your competition and represent your college.")), /* @__PURE__ */ react_default.createElement("div", { className: "arena-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "arena-box arena-box-sports" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "arena-eyebrow" }, "ATHLETIC TOURNAMENTS"), /* @__PURE__ */ react_default.createElement("h3", { className: "arena-title" }, "SPORTS \u2014 ", /* @__PURE__ */ react_default.createElement("em", null, "Compete")), /* @__PURE__ */ react_default.createElement("p", { className: "arena-desc" }, "Dedicated hardcourt and outdoor championship grounds for Basketball, Volleyball, Throwball, Lawn Tennis, and Table Tennis with official collegiate referee panels."), /* @__PURE__ */ react_default.createElement("ul", { className: "arena-features" }, /* @__PURE__ */ react_default.createElement("li", null, "Boys & Girls specific divisional brackets"), /* @__PURE__ */ react_default.createElement("li", null, "Knockout fixtures and match refereeing"), /* @__PURE__ */ react_default.createElement("li", null, "Team championship trophies and individual player laurels"), /* @__PURE__ */ react_default.createElement("li", null, "Official tournament balls and court provisions"))), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.875rem", flexWrap: "wrap" } }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-primary",
      onClick: () => onRegisterClick("Sports")
    },
    "Register for Sports"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary",
      onClick: () => onSelectCategory("sports")
    },
    "Explore Sports Fixtures"
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "arena-box arena-box-cultural" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "arena-eyebrow" }, "STAGE & STUDIO"), /* @__PURE__ */ react_default.createElement("h3", { className: "arena-title" }, "LITERARY & CULTURAL \u2014 ", /* @__PURE__ */ react_default.createElement("em", null, "Create")), /* @__PURE__ */ react_default.createElement("p", { className: "arena-desc" }, "Acoustically engineered auditoriums, outdoor amphitheatre, and fine arts studios showcasing vocal harmonies, choreographies, runway fashion, and dramatic theatre."), /* @__PURE__ */ react_default.createElement("ul", { className: "arena-features" }, /* @__PURE__ */ react_default.createElement("li", null, "Solo and group classifications across Dance & Music"), /* @__PURE__ */ react_default.createElement("li", null, "Flagship Choreoday thematic ensemble showcase"), /* @__PURE__ */ react_default.createElement("li", null, "Professional lighting, concert acoustic audio, and stage tech"), /* @__PURE__ */ react_default.createElement("li", null, "Distinguished external jury evaluation panel"))), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.875rem", flexWrap: "wrap" } }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-cultural",
      onClick: () => onRegisterClick("Literary & Cultural")
    },
    "Register for Cultural"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary",
      onClick: () => onSelectCategory("cultural")
    },
    "Explore Cultural Events"
  ))))));
}

// src/components/RegistrationCTA.jsx
function RegistrationCTA({ onRegisterClick }) {
  return /* @__PURE__ */ react_default.createElement("section", { className: "section-wrapper registration-cta-section" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "cta-box-inner" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow", style: { justifyContent: "center" } }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "INTER-COLLEGE MEET \u2022 2026"), /* @__PURE__ */ react_default.createElement("h2", { className: "heading-section cta-box-title" }, "Ready to take the stage?"), /* @__PURE__ */ react_default.createElement("p", { className: "text-lead cta-box-desc" }, "Choose your competition and complete your official institutional registration. Open to accredited undergraduate and postgraduate students."), /* @__PURE__ */ react_default.createElement("div", { className: "cta-actions" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-primary btn-lg",
      onClick: () => onRegisterClick()
    },
    /* @__PURE__ */ react_default.createElement("span", null, "Register Now"),
    /* @__PURE__ */ react_default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" }))
  )))));
}

// src/api/client.js
var BASE_URL = window.location.origin.includes("http") ? window.location.origin : "";
async function fetchStats() {
  try {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error("Failed to fetch statistics");
    const data = await res.json();
    return data.stats;
  } catch (err) {
    console.warn("API fetchStats fallback to local compute:", err);
    return null;
  }
}
async function fetchRegistrations(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.division && params.division !== "all") query.append("division", params.division);
    if (params.event && params.event !== "all") query.append("event", params.event);
    if (params.search) query.append("search", params.search);
    const queryString = query.toString();
    const url = `${BASE_URL}/api/registrations${queryString ? "?" + queryString : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch registrations");
    const data = await res.json();
    return data.registrations || [];
  } catch (err) {
    console.error("API fetchRegistrations error:", err);
    throw err;
  }
}
async function submitRegistration(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to submit registration");
    }
    return result;
  } catch (err) {
    console.error("API submitRegistration error:", err);
    throw err;
  }
}
async function deleteRegistration(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/${id}`, {
      method: "DELETE"
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to delete registration");
    }
    return result;
  } catch (err) {
    console.error("API deleteRegistration error:", err);
    throw err;
  }
}
function getCsvExportUrl(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.append("category", params.category);
  if (params.division && params.division !== "all") query.append("division", params.division);
  if (params.event && params.event !== "all") query.append("event", params.event);
  if (params.search) query.append("search", params.search);
  const q = query.toString();
  return `${BASE_URL}/api/export-csv${q ? "?" + q : ""}`;
}

// src/components/RegistrationForm.jsx
function RegistrationForm({ initialCategory, initialDivision, initialEvent, onSuccess }) {
  const [formData, setFormData] = useState({
    participantName: "",
    teamName: "",
    college: "",
    email: "",
    phoneNumber: "",
    category: initialCategory || "Sports",
    division: initialDivision || "Boys",
    event: initialEvent || "Basketball"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);
  useEffect(() => {
    if (formData.category === "Sports") {
      const available = formData.division === "Girls" ? SPORTS_DIVISIONS.GIRLS.events.map((e) => e.name) : SPORTS_DIVISIONS.BOYS.events.map((e) => e.name);
      if (!available.includes(formData.event)) {
        setFormData((prev) => ({ ...prev, event: available[0] }));
      }
    } else {
      const culturalEvents = [
        "Fine Arts",
        "Music & Band \u2014 Solo",
        "Music & Band \u2014 Group",
        "Dance \u2014 Solo",
        "Dance \u2014 Group",
        "Choreoday \u2014 Theme Based",
        "Dramatics",
        "Fashion Show",
        "Tekraft Events",
        "Literary"
      ];
      if (!culturalEvents.includes(formData.event)) {
        setFormData((prev) => ({ ...prev, event: culturalEvents[0], division: "Cultural / Open" }));
      }
    }
  }, [formData.category, formData.division]);
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };
  const validate = () => {
    const errs = {};
    if (!formData.participantName.trim() || formData.participantName.trim().length < 2) {
      errs.participantName = "Full Name is required (minimum 2 characters)";
    }
    if (!formData.college.trim() || formData.college.trim().length < 2) {
      errs.college = "College or Institution name is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phoneNumber = "Please provide a valid 10-digit mobile number";
    }
    if (!formData.category) {
      errs.category = "Category selection is required";
    }
    if (formData.category === "Sports" && !formData.division) {
      errs.division = "Please select Boys or Girls division";
    }
    if (!formData.event) {
      errs.event = "Please select an event";
    }
    return errs;
  };
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await submitRegistration(formData);
      setSubmissionSuccess(response.registration);
      if (onSuccess) onSuccess(response.registration);
    } catch (err) {
      setApiError(err.message || "Submission failed. Please check connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setSubmissionSuccess(null);
    setFormData({
      participantName: "",
      teamName: "",
      college: "",
      email: "",
      phoneNumber: "",
      category: "Sports",
      division: "Boys",
      event: "Basketball"
    });
    setErrors({});
  };
  if (submissionSuccess) {
    return /* @__PURE__ */ react_default.createElement("div", { className: "section-wrapper registration-page" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "success-card", style: { maxWidth: "640px", margin: "0 auto" } }, /* @__PURE__ */ react_default.createElement("div", { className: "success-icon-wrap" }, /* @__PURE__ */ react_default.createElement("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" }, /* @__PURE__ */ react_default.createElement("polyline", { points: "20 6 9 17 4 12" }))), /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow", style: { justifyContent: "center" } }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "OFFICIAL CONFIRMATION"), /* @__PURE__ */ react_default.createElement("h2", { className: "heading-section", style: { fontSize: "2rem", marginBottom: "0.5rem" } }, "Registration Confirmed"), /* @__PURE__ */ react_default.createElement("p", { className: "text-body" }, "Your official entry for the ", /* @__PURE__ */ react_default.createElement("strong", null, INSTITUTION.name, " Inter-College Meet 2026"), " has been recorded in the central database."), /* @__PURE__ */ react_default.createElement("div", { className: "registration-ticket" }, /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Registration ID"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val", style: { fontFamily: "var(--font-mono)", color: "var(--accent-institution)" } }, submissionSuccess.registrationId)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Participant / Lead"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, submissionSuccess.participantName)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Team Designation"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, submissionSuccess.teamName || "Individual Entry")), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "College / Institution"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, submissionSuccess.college)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Category & Division"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, submissionSuccess.category, " \u2022 ", submissionSuccess.division)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Registered Event"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val", style: { color: "var(--accent-cultural)" } }, submissionSuccess.event)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Recorded Timestamp"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val", style: { fontSize: "0.75rem" } }, new Date(submissionSuccess.registrationDate).toLocaleString()))), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" } }, /* @__PURE__ */ react_default.createElement(
      "button",
      {
        className: "btn btn-primary",
        onClick: resetForm
      },
      "Register Another Participant"
    ), /* @__PURE__ */ react_default.createElement(
      "button",
      {
        className: "btn btn-secondary",
        onClick: () => window.print()
      },
      "Print Ticket Receipt"
    )))));
  }
  let availableEvents = [];
  if (formData.category === "Sports") {
    availableEvents = formData.division === "Girls" ? SPORTS_DIVISIONS.GIRLS.events.map((e) => e.name) : SPORTS_DIVISIONS.BOYS.events.map((e) => e.name);
  } else {
    availableEvents = [
      "Fine Arts",
      "Music & Band \u2014 Solo",
      "Music & Band \u2014 Group",
      "Dance \u2014 Solo",
      "Dance \u2014 Group",
      "Choreoday \u2014 Theme Based",
      "Dramatics",
      "Fashion Show",
      "Tekraft Events",
      "Literary"
    ];
  }
  return /* @__PURE__ */ react_default.createElement("div", { className: "section-wrapper registration-page" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "form-layout-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "form-info-column" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "OFFICIAL ENTRY PORTAL"), /* @__PURE__ */ react_default.createElement("h1", { className: "heading-section", style: { marginBottom: "1rem" } }, "Event Registration"), /* @__PURE__ */ react_default.createElement("p", { className: "text-body", style: { marginBottom: "1.75rem" } }, "Submit institutional participant entries for the RVRJCCE Inter-College Sports and Literary & Cultural competitions. Verified student IDs required at reporting."), /* @__PURE__ */ react_default.createElement("div", { style: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-sm)",
    padding: "1.25rem",
    marginBottom: "1.5rem"
  } }, /* @__PURE__ */ react_default.createElement("div", { style: { fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--text-primary)" } }, "Registration Guidelines:"), /* @__PURE__ */ react_default.createElement("ul", { style: { listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" } }, /* @__PURE__ */ react_default.createElement("li", null, "\u2713 Valid college identity cards must be presented during technical verification."), /* @__PURE__ */ react_default.createElement("li", null, "\u2713 For team sports and group stage events, specify the team or troupe name."), /* @__PURE__ */ react_default.createElement("li", null, "\u2713 Single participants may represent their college across both sports and cultural disciplines provided schedules do not conflict."), /* @__PURE__ */ react_default.createElement("li", null, "\u2713 Confirmation IDs are issued immediately upon submission."))), /* @__PURE__ */ react_default.createElement("div", { className: "badge badge-navy" }, "Host: ", INSTITUTION.fullName, ", Andhra Pradesh")), /* @__PURE__ */ react_default.createElement("div", { className: "form-card" }, apiError && /* @__PURE__ */ react_default.createElement("div", { style: {
    backgroundColor: "#FFF5F5",
    border: "1px solid #FEB2B2",
    color: "#C53030",
    padding: "0.875rem 1rem",
    borderRadius: "var(--radius-sm)",
    marginBottom: "1.5rem",
    fontSize: "0.875rem"
  } }, apiError), /* @__PURE__ */ react_default.createElement("form", { onSubmit: handleSubmit }, /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Participant Full Name ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "text",
      className: `form-input ${errors.participantName ? "error" : ""}`,
      placeholder: "e.g. K. Siddhartha Reddy",
      value: formData.participantName,
      onChange: (e) => handleChange("participantName", e.target.value)
    }
  ), errors.participantName && /* @__PURE__ */ react_default.createElement("div", { className: "form-error-msg" }, errors.participantName)), /* @__PURE__ */ react_default.createElement("div", { className: "form-row" }, /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Team / Troupe Name"), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "text",
      className: "form-input",
      placeholder: "e.g. RVR Thunder (or leave blank if Solo)",
      value: formData.teamName,
      onChange: (e) => handleChange("teamName", e.target.value)
    }
  ), /* @__PURE__ */ react_default.createElement("div", { className: "form-hint" }, "Optional for solo competitions")), /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "College / Institution ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "text",
      className: `form-input ${errors.college ? "error" : ""}`,
      placeholder: "e.g. RVR & JC College of Engineering",
      value: formData.college,
      onChange: (e) => handleChange("college", e.target.value)
    }
  ), errors.college && /* @__PURE__ */ react_default.createElement("div", { className: "form-error-msg" }, errors.college))), /* @__PURE__ */ react_default.createElement("div", { className: "form-row" }, /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Official / Personal Email ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "email",
      className: `form-input ${errors.email ? "error" : ""}`,
      placeholder: "name@college.edu.in",
      value: formData.email,
      onChange: (e) => handleChange("email", e.target.value)
    }
  ), errors.email && /* @__PURE__ */ react_default.createElement("div", { className: "form-error-msg" }, errors.email)), /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Contact Phone Number ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "tel",
      className: `form-input ${errors.phoneNumber ? "error" : ""}`,
      placeholder: "10-digit mobile number",
      value: formData.phoneNumber,
      onChange: (e) => handleChange("phoneNumber", e.target.value)
    }
  ), errors.phoneNumber && /* @__PURE__ */ react_default.createElement("div", { className: "form-error-msg" }, errors.phoneNumber))), /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Competition Category ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement("div", { className: "segmented-control" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      className: `segment-btn ${formData.category === "Sports" ? "active" : ""}`,
      onClick: () => handleChange("category", "Sports")
    },
    "Sports Championship"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      className: `segment-btn ${formData.category === "Literary & Cultural" ? "active" : ""}`,
      onClick: () => handleChange("category", "Literary & Cultural")
    },
    "Literary & Cultural"
  ))), formData.category === "Sports" && /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Division ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement("div", { className: "segmented-control" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      className: `segment-btn ${formData.division === "Boys" ? "active" : ""}`,
      onClick: () => handleChange("division", "Boys")
    },
    "Boys Division (Basketball, Volleyball, Table Tennis)"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      className: `segment-btn ${formData.division === "Girls" ? "active" : ""}`,
      onClick: () => handleChange("division", "Girls")
    },
    "Girls Division (Throwball, Tennis, Table Tennis)"
  )), errors.division && /* @__PURE__ */ react_default.createElement("div", { className: "form-error-msg" }, errors.division)), /* @__PURE__ */ react_default.createElement("div", { className: "form-group" }, /* @__PURE__ */ react_default.createElement("label", { className: "form-label" }, "Competition Event ", /* @__PURE__ */ react_default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ react_default.createElement(
    "select",
    {
      className: `form-select ${errors.event ? "error" : ""}`,
      value: formData.event,
      onChange: (e) => handleChange("event", e.target.value)
    },
    availableEvents.map((evt, idx) => /* @__PURE__ */ react_default.createElement("option", { key: idx, value: evt }, evt))
  ), errors.event && /* @__PURE__ */ react_default.createElement("div", { className: "form-error-msg" }, errors.event), /* @__PURE__ */ react_default.createElement("div", { className: "form-hint" }, formData.category === "Sports" ? `Showing sports available for ${formData.division} division` : "Showing all curated literary & cultural events")), /* @__PURE__ */ react_default.createElement("div", { style: { marginTop: "2rem" } }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "submit",
      className: "btn btn-primary btn-lg",
      style: { width: "100%" },
      disabled: isSubmitting
    },
    isSubmitting ? "Submitting Registration..." : "Complete Registration"
  )))))));
}

// src/components/AdminDashboard.jsx
function AdminDashboard({ onNavigate }) {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sports: 0,
    cultural: 0,
    boys: 0,
    girls: 0,
    colleges: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [notification, setNotification] = useState(null);
  const PAGE_SIZE = 8;
  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, statData] = await Promise.all([
        fetchRegistrations(),
        fetchStats()
      ]);
      setRegistrations(regs || []);
      if (statData) setStats(statData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4e3);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteRegistration(deleteCandidate._id);
      showNotification(`Record ${deleteCandidate.registrationId} removed successfully.`, "success");
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      showNotification(`Error deleting record: ${err.message}`, "error");
    }
  };
  const filteredRecords = registrations.filter((r) => {
    const matchesSearch = !searchTerm || r.participantName && r.participantName.toLowerCase().includes(searchTerm.toLowerCase()) || r.college && r.college.toLowerCase().includes(searchTerm.toLowerCase()) || r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase()) || r.registrationId && r.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) || r.event && r.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    const matchesDivision = divisionFilter === "all" || r.division === divisionFilter;
    return matchesSearch && matchesCategory && matchesDivision;
  });
  filteredRecords.sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.registrationDate) - new Date(a.registrationDate);
    if (sortBy === "date-asc") return new Date(a.registrationDate) - new Date(b.registrationDate);
    if (sortBy === "name") return (a.participantName || "").localeCompare(b.participantName || "");
    if (sortBy === "college") return (a.college || "").localeCompare(b.college || "");
    return 0;
  });
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return /* @__PURE__ */ react_default.createElement("div", { className: "section-wrapper admin-page" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "admin-header" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow" }, /* @__PURE__ */ react_default.createElement("span", { className: "eyebrow-dot" }), "INSTITUTIONAL ADMINISTRATION"), /* @__PURE__ */ react_default.createElement("h1", { className: "heading-section", style: { fontSize: "2.25rem" } }, "University Registration Console"), /* @__PURE__ */ react_default.createElement("div", { style: { fontSize: "0.875rem", color: "var(--text-muted)" } }, INSTITUTION.name, " Event Organizing Committee \u2022 Inter-College Meet 2026")), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.75rem", alignItems: "center" } }, /* @__PURE__ */ react_default.createElement(
    "a",
    {
      href: getCsvExportUrl({ category: categoryFilter, division: divisionFilter, search: searchTerm }),
      className: "btn btn-secondary btn-sm",
      download: true
    },
    /* @__PURE__ */ react_default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" })),
    /* @__PURE__ */ react_default.createElement("span", null, "Export CSV")
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-primary btn-sm",
      onClick: loadData
    },
    "Refresh Data"
  ))), notification && /* @__PURE__ */ react_default.createElement("div", { style: {
    padding: "0.75rem 1.25rem",
    backgroundColor: notification.type === "error" ? "#FDF2F2" : "#EFF6FF",
    border: `1px solid ${notification.type === "error" ? "#F8B4B4" : "#BFDBFE"}`,
    color: notification.type === "error" ? "#9B1C1C" : "#1E40AF",
    borderRadius: "var(--radius-sm)",
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  } }, /* @__PURE__ */ react_default.createElement("span", null, notification.msg), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      onClick: () => setNotification(null),
      style: { background: "none", border: "none", cursor: "pointer", color: "inherit" }
    },
    "\u2715"
  )), /* @__PURE__ */ react_default.createElement("div", { className: "admin-metrics-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "admin-metric-card", style: { borderTop: "3px solid var(--text-primary)" } }, /* @__PURE__ */ react_default.createElement("span", { className: "metric-number" }, stats.total), /* @__PURE__ */ react_default.createElement("span", { className: "metric-label" }, "Total Entries")), /* @__PURE__ */ react_default.createElement("div", { className: "admin-metric-card", style: { borderTop: "3px solid var(--accent-institution)" } }, /* @__PURE__ */ react_default.createElement("span", { className: "metric-number", style: { color: "var(--accent-institution)" } }, stats.sports), /* @__PURE__ */ react_default.createElement("span", { className: "metric-label" }, "Sports Registrations")), /* @__PURE__ */ react_default.createElement("div", { className: "admin-metric-card", style: { borderTop: "3px solid var(--accent-cultural)" } }, /* @__PURE__ */ react_default.createElement("span", { className: "metric-number", style: { color: "var(--accent-cultural)" } }, stats.cultural), /* @__PURE__ */ react_default.createElement("span", { className: "metric-label" }, "Cultural Registrations")), /* @__PURE__ */ react_default.createElement("div", { className: "admin-metric-card", style: { borderTop: "3px solid #1652A0" } }, /* @__PURE__ */ react_default.createElement("span", { className: "metric-number" }, stats.boys), /* @__PURE__ */ react_default.createElement("span", { className: "metric-label" }, "Boys Division")), /* @__PURE__ */ react_default.createElement("div", { className: "admin-metric-card", style: { borderTop: "3px solid #84235E" } }, /* @__PURE__ */ react_default.createElement("span", { className: "metric-number" }, stats.girls), /* @__PURE__ */ react_default.createElement("span", { className: "metric-label" }, "Girls Division"))), /* @__PURE__ */ react_default.createElement("div", { className: "admin-controls-card" }, /* @__PURE__ */ react_default.createElement("div", { className: "search-input-wrap" }, /* @__PURE__ */ react_default.createElement("span", { className: "search-icon" }, /* @__PURE__ */ react_default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ react_default.createElement("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }))), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "text",
      className: "search-input",
      placeholder: "Search participant, college, team, or ID...",
      value: searchTerm,
      onChange: (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }
    }
  )), /* @__PURE__ */ react_default.createElement("div", { className: "filters-group" }, /* @__PURE__ */ react_default.createElement(
    "select",
    {
      className: "filter-select",
      value: categoryFilter,
      onChange: (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
      }
    },
    /* @__PURE__ */ react_default.createElement("option", { value: "all" }, "All Categories"),
    /* @__PURE__ */ react_default.createElement("option", { value: "Sports" }, "Sports"),
    /* @__PURE__ */ react_default.createElement("option", { value: "Literary & Cultural" }, "Literary & Cultural")
  ), /* @__PURE__ */ react_default.createElement(
    "select",
    {
      className: "filter-select",
      value: divisionFilter,
      onChange: (e) => {
        setDivisionFilter(e.target.value);
        setCurrentPage(1);
      }
    },
    /* @__PURE__ */ react_default.createElement("option", { value: "all" }, "All Divisions"),
    /* @__PURE__ */ react_default.createElement("option", { value: "Boys" }, "Boys"),
    /* @__PURE__ */ react_default.createElement("option", { value: "Girls" }, "Girls"),
    /* @__PURE__ */ react_default.createElement("option", { value: "Cultural / Open" }, "Cultural / Open")
  ), /* @__PURE__ */ react_default.createElement(
    "select",
    {
      className: "filter-select",
      value: sortBy,
      onChange: (e) => setSortBy(e.target.value)
    },
    /* @__PURE__ */ react_default.createElement("option", { value: "date-desc" }, "Newest First"),
    /* @__PURE__ */ react_default.createElement("option", { value: "date-asc" }, "Oldest First"),
    /* @__PURE__ */ react_default.createElement("option", { value: "name" }, "Participant Name"),
    /* @__PURE__ */ react_default.createElement("option", { value: "college" }, "College Name")
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "table-container" }, /* @__PURE__ */ react_default.createElement("table", { className: "admin-table" }, /* @__PURE__ */ react_default.createElement("thead", null, /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("th", null, "Registration ID"), /* @__PURE__ */ react_default.createElement("th", null, "Participant & Team"), /* @__PURE__ */ react_default.createElement("th", null, "College / Institution"), /* @__PURE__ */ react_default.createElement("th", null, "Contact Details"), /* @__PURE__ */ react_default.createElement("th", null, "Category"), /* @__PURE__ */ react_default.createElement("th", null, "Division"), /* @__PURE__ */ react_default.createElement("th", null, "Event"), /* @__PURE__ */ react_default.createElement("th", null, "Status"), /* @__PURE__ */ react_default.createElement("th", { style: { textAlign: "right" } }, "Actions"))), /* @__PURE__ */ react_default.createElement("tbody", null, loading ? /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("td", { colSpan: "9", style: { textAlign: "center", padding: "3rem" } }, /* @__PURE__ */ react_default.createElement("div", { className: "text-body" }, "Loading registrations from database..."))) : paginatedRecords.length === 0 ? /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("td", { colSpan: "9", style: { textAlign: "center", padding: "3rem" } }, /* @__PURE__ */ react_default.createElement("div", { className: "text-body", style: { color: "var(--text-muted)" } }, "No registration submissions match your filter criteria."))) : paginatedRecords.map((r) => /* @__PURE__ */ react_default.createElement("tr", { key: r._id || r.registrationId }, /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("span", { style: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.8125rem", color: "var(--accent-institution)" } }, r.registrationId)), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("div", { className: "participant-cell" }, /* @__PURE__ */ react_default.createElement("span", { className: "participant-name" }, r.participantName), /* @__PURE__ */ react_default.createElement("span", { className: "participant-team" }, r.teamName || "Individual"))), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("span", { style: { fontSize: "0.8125rem" } }, r.college)), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("div", { className: "contact-cell" }, /* @__PURE__ */ react_default.createElement("span", { className: "contact-email" }, r.email), /* @__PURE__ */ react_default.createElement("span", { className: "contact-phone" }, r.phoneNumber))), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("span", { className: `badge ${r.category === "Sports" ? "badge-navy" : "badge-terracotta"}` }, r.category)), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("span", { style: { fontSize: "0.8125rem", color: "var(--text-secondary)" } }, r.division)), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("strong", { style: { fontSize: "0.8125rem", color: "var(--text-primary)" } }, r.event)), /* @__PURE__ */ react_default.createElement("td", null, /* @__PURE__ */ react_default.createElement("span", { className: "status-pill status-confirmed" }, r.status || "Confirmed")), /* @__PURE__ */ react_default.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ react_default.createElement("div", { className: "action-buttons", style: { justifyContent: "flex-end" } }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "icon-btn",
      title: "View Details",
      onClick: () => setSelectedRecord(r)
    },
    /* @__PURE__ */ react_default.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "12", cy: "12", r: "3" }))
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "icon-btn icon-btn-danger",
      title: "Delete / Archive Entry",
      onClick: () => setDeleteCandidate(r)
    },
    /* @__PURE__ */ react_default.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ react_default.createElement("polyline", { points: "3 6 5 6 21 6" }), /* @__PURE__ */ react_default.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }))
  ))))))), /* @__PURE__ */ react_default.createElement("div", { className: "pagination-strip" }, /* @__PURE__ */ react_default.createElement("div", null, "Showing ", filteredRecords.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0, " to", " ", Math.min(currentPage * PAGE_SIZE, filteredRecords.length), " of ", filteredRecords.length, " submissions"), /* @__PURE__ */ react_default.createElement("div", { style: { display: "flex", gap: "0.375rem" } }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      disabled: currentPage <= 1,
      onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1))
    },
    "Previous"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      disabled: currentPage >= totalPages,
      onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    },
    "Next"
  )))), selectedRecord && /* @__PURE__ */ react_default.createElement("div", { className: "modal-backdrop", onClick: () => setSelectedRecord(null) }, /* @__PURE__ */ react_default.createElement("div", { className: "modal-card", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ react_default.createElement("div", { className: "modal-header" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent-institution)" } }, selectedRecord.registrationId), /* @__PURE__ */ react_default.createElement("h3", { className: "heading-subsection" }, selectedRecord.participantName)), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "icon-btn",
      onClick: () => setSelectedRecord(null)
    },
    "\u2715"
  )), /* @__PURE__ */ react_default.createElement("div", { className: "modal-body" }, /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "College"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, selectedRecord.college)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Team / Troupe"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, selectedRecord.teamName || "Individual Entry")), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Category"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, selectedRecord.category)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Division"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, selectedRecord.division)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Event"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val", style: { color: "var(--accent-cultural)" } }, selectedRecord.event)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Email"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, selectedRecord.email)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Phone"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, selectedRecord.phoneNumber)), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Registration Date"), /* @__PURE__ */ react_default.createElement("span", { className: "ticket-val" }, new Date(selectedRecord.registrationDate).toLocaleString())), /* @__PURE__ */ react_default.createElement("div", { className: "ticket-row" }, /* @__PURE__ */ react_default.createElement("span", { className: "ticket-label" }, "Verification Status"), /* @__PURE__ */ react_default.createElement("span", { className: "status-pill status-confirmed" }, selectedRecord.status || "Confirmed"))), /* @__PURE__ */ react_default.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      onClick: () => setSelectedRecord(null)
    },
    "Close"
  )))), deleteCandidate && /* @__PURE__ */ react_default.createElement("div", { className: "modal-backdrop", onClick: () => setDeleteCandidate(null) }, /* @__PURE__ */ react_default.createElement("div", { className: "modal-card", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ react_default.createElement("div", { className: "modal-header" }, /* @__PURE__ */ react_default.createElement("h3", { className: "heading-subsection", style: { color: "#C53030" } }, "Confirm Removal"), /* @__PURE__ */ react_default.createElement("button", { className: "icon-btn", onClick: () => setDeleteCandidate(null) }, "\u2715")), /* @__PURE__ */ react_default.createElement("div", { className: "modal-body" }, /* @__PURE__ */ react_default.createElement("p", { className: "text-body" }, "Are you sure you want to permanently delete registration ", /* @__PURE__ */ react_default.createElement("strong", null, deleteCandidate.registrationId), " for ", /* @__PURE__ */ react_default.createElement("strong", null, deleteCandidate.participantName), " (", deleteCandidate.event, ")?"), /* @__PURE__ */ react_default.createElement("p", { className: "text-caption", style: { marginTop: "0.5rem", color: "#C53030" } }, "This action will remove the record from MongoDB persistent storage and cannot be undone.")), /* @__PURE__ */ react_default.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ react_default.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setDeleteCandidate(null) }, "Cancel"), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      className: "btn btn-sm",
      style: { backgroundColor: "#C53030", color: "#FFFFFF", borderColor: "#C53030" },
      onClick: handleDeleteConfirm
    },
    "Confirm Delete"
  ))))));
}

// src/components/Footer.jsx
function Footer({ onNavigate }) {
  const handleNav = (route, sectionId = null) => {
    onNavigate(route);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ react_default.createElement("footer", { className: "site-footer" }, /* @__PURE__ */ react_default.createElement("div", { className: "container" }, /* @__PURE__ */ react_default.createElement("div", { className: "footer-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "footer-brand-column" }, /* @__PURE__ */ react_default.createElement("div", { className: "footer-brand-title" }, INSTITUTION.name), /* @__PURE__ */ react_default.createElement("p", { className: "footer-accreditation" }, INSTITUTION.fullName, /* @__PURE__ */ react_default.createElement("br", null), INSTITUTION.location, /* @__PURE__ */ react_default.createElement("br", null), INSTITUTION.accreditation), /* @__PURE__ */ react_default.createElement("div", { style: { fontSize: "0.8125rem", color: "var(--text-muted)" } }, "Annual Inter-College Sports & Cultural Meet")), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "footer-heading" }, "Sports"), /* @__PURE__ */ react_default.createElement("ul", { className: "footer-links" }, /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "sports-section") }, "Basketball (Boys)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "sports-section") }, "Volleyball (Boys)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "sports-section") }, "Throwball (Girls)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "sports-section") }, "Tennis (Girls)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "sports-section") }, "Table Tennis (Boys & Girls)")))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "footer-heading" }, "Literary & Cultural"), /* @__PURE__ */ react_default.createElement("ul", { className: "footer-links" }, /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "cultural-section") }, "Fine Arts")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "cultural-section") }, "Music & Band (Solo/Group)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "cultural-section") }, "Dance (Solo/Group)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "cultural-section") }, "Choreoday (Theme Based)")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "cultural-section") }, "Dramatics & Fashion Show")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "cultural-section") }, "Tekraft & Literary")))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "footer-heading" }, "Portal & Desk"), /* @__PURE__ */ react_default.createElement("ul", { className: "footer-links" }, /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("register") }, "Participant Registration")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("admin") }, "Admin Management Portal")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("a", { onClick: () => handleNav("home", "intro-section") }, "Institutional Ethos")), /* @__PURE__ */ react_default.createElement("li", null, /* @__PURE__ */ react_default.createElement("span", { style: { fontSize: "0.8125rem", color: "var(--text-muted)" } }, "Organizing Committee Secretariat", /* @__PURE__ */ react_default.createElement("br", null), "Campus Event Office, ", INSTITUTION.name))))), /* @__PURE__ */ react_default.createElement("div", { className: "footer-bottom" }, /* @__PURE__ */ react_default.createElement("div", null, "\xA9 2026 ", INSTITUTION.name, ". All institutional rights reserved."), /* @__PURE__ */ react_default.createElement("div", null, "Inter-College Sports, Literary & Cultural Festival"))));
}

// src/App.jsx
function App() {
  const getInitialRoute = () => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/^\//, "");
      if (path === "register") return "register";
      if (path === "admin") return "admin";
    }
    return "home";
  };
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [prefilledEvent, setPrefilledEvent] = useState({
    category: "Sports",
    division: "Boys",
    event: "Basketball"
  });
  const [liveStats, setLiveStats] = useState(null);
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, "");
      if (path === "register") setCurrentRoute("register");
      else if (path === "admin") setCurrentRoute("admin");
      else setCurrentRoute("home");
    };
    window.addEventListener("popstate", handlePopState);
    handlePopState();
    fetchStats().then((stats) => {
      if (stats) setLiveStats(stats);
    });
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const navigateTo = (route, pushState = true) => {
    setCurrentRoute(route);
    if (pushState) {
      const url = route === "home" ? "/" : `/${route}`;
      window.history.pushState({}, "", url);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleRegisterSpecificEvent = (category, division, eventName) => {
    setPrefilledEvent({
      category: category || "Sports",
      division: division || "Boys",
      event: eventName || "Basketball"
    });
    navigateTo("register");
  };
  const handleScrollToSection = (sectionId) => {
    if (currentRoute !== "home") {
      navigateTo("home");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ react_default.createElement("div", { className: "site-wrapper" }, /* @__PURE__ */ react_default.createElement(
    Navbar,
    {
      currentRoute,
      onNavigate: navigateTo
    }
  ), /* @__PURE__ */ react_default.createElement("main", null, currentRoute === "home" && /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement(
    Hero,
    {
      onExploreEvents: () => handleScrollToSection("discovery-section"),
      onRegisterClick: () => navigateTo("register")
    }
  ), /* @__PURE__ */ react_default.createElement(IntroSection, { liveStats }), /* @__PURE__ */ react_default.createElement(
    EventDiscovery,
    {
      onSelectCategory: (cat) => handleScrollToSection(cat === "sports" ? "sports-section" : "cultural-section")
    }
  ), /* @__PURE__ */ react_default.createElement(
    SportsSection,
    {
      onRegisterEvent: handleRegisterSpecificEvent
    }
  ), /* @__PURE__ */ react_default.createElement(
    LiteraryCulturalSection,
    {
      onRegisterEvent: handleRegisterSpecificEvent
    }
  ), /* @__PURE__ */ react_default.createElement(
    FeaturedArena,
    {
      onSelectCategory: (cat) => handleScrollToSection(cat === "sports" ? "sports-section" : "cultural-section"),
      onRegisterClick: (cat) => {
        setPrefilledEvent((prev) => ({
          ...prev,
          category: cat || "Sports"
        }));
        navigateTo("register");
      }
    }
  ), /* @__PURE__ */ react_default.createElement(
    RegistrationCTA,
    {
      onRegisterClick: () => navigateTo("register")
    }
  )), currentRoute === "register" && /* @__PURE__ */ react_default.createElement(
    RegistrationForm,
    {
      initialCategory: prefilledEvent.category,
      initialDivision: prefilledEvent.division,
      initialEvent: prefilledEvent.event,
      onSuccess: () => {
        fetchStats().then((stats) => {
          if (stats) setLiveStats(stats);
        });
      }
    }
  ), currentRoute === "admin" && /* @__PURE__ */ react_default.createElement(
    AdminDashboard,
    {
      onNavigate: navigateTo
    }
  )), /* @__PURE__ */ react_default.createElement(Footer, { onNavigate: navigateTo }));
}

// src/index.jsx
console.log("[RVRJCCE] Initializing App mounting...");
var container = document.getElementById("root");
if (container) {
  try {
    react_default.render(react_default.createElement(App, null), container);
    console.log("[RVRJCCE] App mounted! Root child nodes:", container.childNodes.length);
    console.log("[RVRJCCE] Root innerHTML length:", container.innerHTML.length);
    const headings = Array.from(container.querySelectorAll("h1, h2, h3")).map((h) => h.textContent.trim());
    console.log("[RVRJCCE] Rendered Headings:", JSON.stringify(headings));
  } catch (err) {
    console.error("[RVRJCCE] Error during render:", err);
  }
}
