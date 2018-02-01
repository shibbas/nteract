// @flow
/* global MathJax */

import * as React from "react";
import PropTypes from "prop-types";
import loadScript from "./load-script";

// MathJax expected to be a global and may be undefined
declare var MathJax: ?Object;

export type Props = {
  children: React.Node,
  didFinishTypeset: ?() => void,
  script: string | false,
  input: "ascii" | "tex",
  delay: number,
  options: Object,
  loading: React.Node,
  noGate: boolean,
  onError: (err: Error) => void,
  onLoad: ?Function
};

/**
 * Context for loading MathJax
 */
class Context extends React.Component<Props, *> {
  static defaultProps = {
    script:
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
    input: "tex",
    didFinishTypeset: null,
    delay: 0,
    options: {},
    loading: null,
    noGate: false,
    onLoad: null,
    onError: (err: Error) => {
      console.error(err);
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = { loaded: false };
    (this: any).onLoad = this.onLoad.bind(this);
  }

  getChildContext() {
    return {
      // Here we see if MathJax is defined globally by running a typeof on a
      // potentially not set value then explicitly setting the MathJax context
      // to undefined.
      MathJax: typeof MathJax === "undefined" ? undefined : MathJax,
      input: this.props.input,
      MathJaxContext: true
    };
  }

  componentDidMount() {
    const script = this.props.script;

    if (!script) {
      return this.onLoad();
    }

    loadScript(script, this.onLoad);
  }

  onLoad() {
    if (!MathJax || !MathJax.Hub) {
      this.props.onError(
        new Error("MathJax not really loaded even though onLoad called")
      );
      return;
    }

    const options = this.props.options;

    MathJax.Hub.Config(options);

    MathJax.Hub.Register.StartupHook("End", () => {
      if (!MathJax) {
        this.props.onError(
          new Error("MathJax became undefined in the middle of processing")
        );
        return;
      }
      MathJax.Hub.processSectionDelay = this.props.delay;

      if (this.props.didFinishTypeset) {
        this.props.didFinishTypeset();
      }
    });

    MathJax.Hub.Register.MessageHook("Math Processing Error", message => {
      if (this.props.onError) {
        this.props.onError(message);
      }
    });

    if (this.props.onLoad) {
      this.props.onLoad();
    }

    this.setState({
      loaded: true
    });
  }

  render() {
    if (!this.state.loaded && !this.props.noGate) {
      return this.props.loading;
    }

    const children = this.props.children;

    return React.Children.only(children);
  }
}

Context.childContextTypes = {
  MathJax: PropTypes.object,
  input: PropTypes.string,
  MathJaxContext: PropTypes.bool
};

export default Context;