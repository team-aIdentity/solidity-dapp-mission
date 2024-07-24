import React from 'react'
import { Modal } from 'antd';
import { Address, Balance } from '~~/components/scaffold-eth';

const TransactionDetail = ({txnInfo, visible, handleModalClose}) => {
  return (
    <Modal
      title="Transaction Details"
      open={visible}
      onCancel={handleModalClose}
      destroyOnClose
      onOk={handleModalClose}
      footer={null}
      closable
      maskClosable
    >

      {txnInfo && (
        <div>
          <p className='mt-8'>
            <b>Event Name :</b> {txnInfo.fragment.name}
          </p>
          <p>
            <b>Function Signature :</b> {txnInfo.signature}
          </p>
          {txnInfo.fragment.inputs.map((element, index) => {
            if (element.type === "address") {
              return (
                <div key={element.name} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}>
                  <b>{element.name} :&nbsp;</b>
                  <Address fontSize={16} address={txnInfo.args[index]} />
                </div>
              );
            }
            if (element.type === "uint256") {
              return (
                <p key={element.name}>
                  {element.name === "value" ? <><b>{element.name} : </b> <Balance fontSize={16} balance={txnInfo.args[index]}/> </> : <><b>{element.name} : </b> {txnInfo.args[index] && Number(txnInfo.args[index])}</>}
                </p>
              );
            }
          })}
          <p>
            <b>SigHash : &nbsp;</b>
            {txnInfo.selector}
          </p>
        </div>
      )}

    </Modal>
  )
}

export default TransactionDetail
