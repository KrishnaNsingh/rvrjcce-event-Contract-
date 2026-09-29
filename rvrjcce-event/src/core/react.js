import React, {
  createElement,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import ReactDOM from 'react-dom/client';

let rootInstance = null;

function render(vnode, rootContainer) {
  if (!rootInstance) {
    rootInstance = ReactDOM.createRoot(rootContainer);
  }
  rootInstance.render(vnode);
  return rootContainer;
}

const ReactWrapper = {
  ...React,
  createElement,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  render
};

export {
  createElement,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  render
};

export default ReactWrapper;
