import { AppRegistry } from 'react-native'
import React from 'react'
import 'react-native-crypto'
import WebviewCrypto from 'react-native-webview-crypto'
import SQLite from 'react-native-sqlite-2'
import setGlobalVars from '@indexeddbshim/indexeddbshim/dist/indexeddbshim-noninvasive'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-gesture-handler'

import env from './src/config/env'
import App from './src/mainApp/AppHolder'
import { name as appName } from './app.json'

import './src/pushNotifications'
import './src/lib/utils/deepLinking'
import withHotCodePush from './src/lib/hoc/withHotCodePush'

// shim indexdb
setGlobalVars(window, { checkOrigin: false, win: SQLite })

const DeApp = withHotCodePush(() => (
  <SafeAreaProvider>
    <WebviewCrypto />
    <App />
  </SafeAreaProvider>
))

console.disableYellowBox = !!env.TEST_REACT_NATIVE

AppRegistry.registerComponent(appName, () => DeApp)
