// @flow
import Web3 from 'web3'
import Config from '../../config/config'
import SoftwareWalletProvider from './SoftwareWalletProvider'

export type WalletConfig = {
  network_id: number,
  httpWeb3provider: string,
  websocketWeb3Provider: string,
  web3Transport: string,
}

export default class WalletFactory {
  static create(walletConf: WalletConfig): Promise<Web3> {
    let provider: SoftwareWalletProvider = new SoftwareWalletProvider({
      ...Config.ethereum[walletConf.network_id || Config.networkId],
      ...walletConf,
    })
    return provider.ready
  }
}
