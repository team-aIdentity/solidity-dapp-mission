import { Address } from "../../components/scaffold-eth/Address";
import { List } from "antd";
import { useScaffoldEventHistory, useTargetNetwork } from "~~/hooks/scaffold-eth";

export default function EventsMultiDice() {
  const { data: events } = useScaffoldEventHistory({
    contractName: "MultiDiceRolls",
    eventName: "Rolled",
    fromBlock: 0n,
  });
  console.log("Multi Dice Roll events: ", events);

  return (
    <div style={{ width: "100%", margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>Events:</h2>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          return (
            <List.Item
              key={item.blockNumber}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
            >
              <div>{`Block:: ${item.blockNumber}`}</div>
              <div>
                {`Roller:: `} <Address address={item.args[6]} />
              </div>
              <div>{`Roll: [${item.args[0]}, ${item.args[1]}, ${item.args[2]}, ${item.args[3]}, ${item.args[4]}, ${item.args[5]}]`}</div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
