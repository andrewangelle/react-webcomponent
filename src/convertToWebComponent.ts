import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import camelCaseKeys from 'camelcase-keys';
import parseHtmlString from 'html-react-parser';

export type RegisterOptions = {
  tagName: string;
  React: typeof React,
  ReactDOM: typeof ReactDOM;
  ReactDOMClient?: typeof ReactDOMClient;
  styleSheet?: string | string[];
  shadowDOM?: boolean;
}

export function convertToWebComponent(
  Component: <Props>(props: Props) => JSX.Element,
  options: RegisterOptions
) {
  return class ReactToWebComponent extends HTMLElement {
    observer: MutationObserver;
    mountPoint: HTMLElement;
    withShadowDOM: boolean;
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    ReactDOMClient?: typeof ReactDOMClient;
    reactChildren?: React.ReactNode[];

    constructor(){
      super();
      this.style.display = 'none';
      this.React = options?.React;
      this.ReactDOM = options?.ReactDOM;
      this.ReactDOMClient = options?.ReactDOMClient;
      
      this.mountPoint = document.createElement('div');
      this.mountPoint.setAttribute('data-react-root', '');
      this.withShadowDOM = options?.shadowDOM ?? true;
      this.reactChildren = this.parseHtmlToReact(this.innerHTML || '');

      if(this.withShadowDOM){
        this.attachShadow({ mode: 'open' });
      } else {
        this.innerHTML = '';
        this.appendChild(this.mountPoint)
      }

      if(options?.styleSheet){
        this.createStylesheet(options?.styleSheet)
      }

      this.observer = new MutationObserver(() => this.mountReactNode());
      this.observer.observe(this, { attributes: true });
    }

    observedAttributes(): NamedNodeMap {
      return this.attributes;
    }

    connectedCallback(): void {
      this.appendChildNode(this.mountPoint);
      this.mountReactNode();
    }

    disconnectedCallback(): void {
      this.ReactDOM.unmountComponentAtNode(this.mountPoint);
      this.removeChildNode(this.mountPoint);
      this.observer.disconnect();
    }

    attributeChangedCallback(): void {
      this.appendChildNode(this.mountPoint); 
      this.mountReactNode();      
    }

    appendChildNode<ElementType extends Node>(node: ElementType): void {
      if(this.withShadowDOM){
        this.shadowRoot?.appendChild(node);  
      } else {
        this.appendChild(node)
      }
    }

    removeChildNode<ElementType extends Node>(node: ElementType): void {
      if(this.withShadowDOM){
        this.shadowRoot?.removeChild(node)
      } else {
        this.removeChild(node)
      }
    }

    mountReactNode(): void {
      const { StrictMode, createElement } = this.React;
      const { render } = this.ReactDOM;

      const props = camelCaseKeys({
        ...this.getProps(),
        ...this.getEvents(),
      });

      let reactComponent: React.FunctionComponentElement<{
        children?: React.ReactNode;
      }>

      const consumerComponent = createElement(Component, props, this.reactChildren);
      
      if(StrictMode !== undefined){
        reactComponent = createElement(StrictMode, {}, consumerComponent);
      } else {
        reactComponent = consumerComponent
      }
      
      if(this.ReactDOMClient !== undefined){
        const { createRoot } = this.ReactDOMClient;
        const root = createRoot(this.mountPoint);
        root.render(reactComponent);
      } else {
        render(reactComponent, this.mountPoint);
      }

      if(this.withShadowDOM){
        this.innerHTML = ''
      }

      this.style.display = ''
    }

    parseHtmlToReact(html: string): React.ReactNode[] {
      if(html){
        const parsed = parseHtmlString(html) as unknown as React.ReactNode[]
        return parsed.filter(element => typeof element !== 'string')
      }

      return []
    }

    getProps(): Record<string, any> {
      return Array
        .from(this.attributes)
        .filter(attr => attr.name !== 'style')
        .map(this.convertAttributesToProps)
        .reduce((props, {name, value}) => ({...props, [name]: value}), {})
    }

    getEvents(): Record<string, (args: any) => void> {
      return Object
        .values(this.attributes)
        .filter(key => /on([a-z,-].*)/.exec(key.name))
        .reduce((events, event) => ({
          ...events,
          [event.name]: (args: any) =>
            this.dispatchEvent(new CustomEvent(event.name, {...args}))
        }), {});
    }

    convertAttributesToProps({
      name: attrName, 
      value: attrValue
    }:{
      name: string; 
      value: any;
    }): Record<string, any> {
      let value: any;

      value = attrValue;
      
      const isEventHandler = /on([a-z,-].*)/.exec(attrName);
      const isJson = !isEventHandler 
        && typeof JSON.parse(attrValue) === 'object';
      const isNumber = typeof parseInt(attrValue) === 'number' 
        && !isEventHandler 
        && typeof JSON.parse(attrValue) !== 'object';
      const isString = Number.isNaN(attrValue) 
        && attrValue !== '';
      const isBoolean = attrValue === 'true' || attrValue === 'false';

      if(isBoolean){
        value = attrValue === 'true';

      } else if(isString) {
        value = +attrValue;

      } else if(isNumber){
        value = parseInt(value);

      } else if(isJson) {
        value = (JSON.parse(attrValue));
      }

      return {
        name: attrName,
        value
      };
    } 

    createStylesheet(path: string | string[]): void {
      const styleNode = document.createElement('style');

      if(typeof path === 'string'){
        styleNode.innerHTML = `
          @import '${path}';
        `
      } else { // it's an array
        styleNode.innerHTML = path
          .map(filePath => `@import '${filePath}';`)
          .join('\n')
      }

      this.appendChildNode(styleNode)
    }
  }
}
