import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { production } from "@lens-protocol/react-web";
import { bindings } from "@lens-protocol/wagmi";

export const wagmiConfig = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(),
  },
});

export const lensConfig = {
  environment: production,
  bindings: bindings(wagmiConfig),
};