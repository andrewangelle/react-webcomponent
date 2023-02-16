
import { convertToWebComponent, RegisterOptions } from "./convertToWebComponent";

export function registerComponent(
  Component: (props: any) => JSX.Element,
  options: RegisterOptions
): void {

  customElements.define(
    options.tagName, 
    convertToWebComponent(Component, options)
  )
}
