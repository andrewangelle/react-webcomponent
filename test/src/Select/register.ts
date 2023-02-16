import React from 'react';
import ReactDOM from 'react-dom'
import ReactDOMClient from 'react-dom/client';
import { registerComponent, RegisterOptions } from 'react-webcomponent'
import { Select } from './Select';

const options: RegisterOptions = {
  tagName: 'select-test',
  React,
  ReactDOM,
  ReactDOMClient,
  shadowDOM: false
}

registerComponent(Select, options)