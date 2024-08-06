import React from "react";
import { Address } from "./scaffold-eth";
import { utils } from "ethers";

const tryToDisplay = (thing: any, asText = false) => {
  if (thing && thing.toNumber) {
    try {
      return thing.toNumber();
    } catch (e) {
      const displayable = "Ξ" + utils.formatUnits(thing, "ether");
      return asText ? displayable : <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable}</span>;
    }
  }
  if (thing && thing.indexOf && thing.indexOf("0x") === 0) {
    if (thing.length === 42) {
      return asText ? thing : <Address address={thing} />;
    } else {
      return asText ? thing : <span style={{ overflowWrap: "break-word", width: "100%" }}>{thing}</span>;
    }
  }
  if (thing && thing.constructor && thing.constructor.name == "Array") {
    const mostReadable = (v: any) => (["number", "boolean"].includes(typeof v) ? v : tryToDisplayAsText(v));
    return JSON.stringify(thing.map(mostReadable));
  }
  return JSON.stringify(thing);
};

const tryToDisplayAsText = (thing: any) => tryToDisplay(thing, true);

export { tryToDisplay, tryToDisplayAsText };
