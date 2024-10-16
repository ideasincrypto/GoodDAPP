// libraries
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { ActivityIndicator, Image, Platform, View } from 'react-native'
import { t } from '@lingui/macro'
import { useIdentityExpiryDate } from '@gooddollar/web3sdk-v2'

import useFVRedirect from '../standalone/hooks/useFVRedirect'

// components
import Text from '../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../common'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'
import useCameraSupport from '../../browserSupport/hooks/useCameraSupport'
import usePermissions from '../../permissions/hooks/usePermissions'
import useDisposingState from '../hooks/useDisposingState'
import useEnrollmentIdentifier from '../hooks/useEnrollmentIdentifier'

import { useWallet } from '../../../lib/wallet/GoodWalletProvider'

// utils
import logger from '../../../lib/logger/js-logger'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth, isSmallDevice } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import { iosSupportedWeb, isBrowser, isEmulator, isIOSWeb, isWebView } from '../../../lib/utils/platform'
import { openLink } from '../../../lib/utils/linking'
import Config from '../../../config/config'
import { Permissions } from '../../permissions/types'
import { showQueueDialog } from '../../common/dialogs/showQueueDialog'
import { useDialog } from '../../../lib/dialog/useDialog'
import { fireEvent, FV_CAMERAPERMISSION, FV_CANTACCESSCAMERA, FV_INTRO } from '../../../lib/analytics/analytics'
import { FVFlowContext } from '../standalone/context/FVFlowContext'
import useFaceTecSDK from '../hooks/useFaceTecSDK'
import { UnsupportedWebview } from '../../browserSupport/components/UnsupportedBrowser'
import AsyncStorage from '../../../lib/utils/asyncStorage'

// assets
import Wait24HourSVG from '../../../assets/Claim/wait24Hour.svg'

import FashionShootSVG from '../../../assets/FaceVerification/FashionPhotoshoot.svg'
import BillyVerifies from '../../../assets/billy-verifies.png'
import useProfile from '../../../lib/userStorage/useProfile'
import useFVLoginInfoCheck from '../standalone/hooks/useFVLoginInfoCheck'

const log = logger.child({ from: 'FaceVerificationIntro' })

const WalletDeletedPopupText = ({ styles }) => (
  <View style={styles.wrapper}>
    <View style={styles.title}>
      <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
        {t`New Wallet?`}
        {t`You’ll need to wait 24 hours`}
      </Text>
    </View>
    <View style={styles.paddingVertical20}>
      <Text style={styles.textStyle}>
        {t`We see you recently deleted your wallet and have opened a new one.`}
        {t`This delay is to prevent misuse, thanks for understanding!`}
      </Text>
    </View>
  </View>
)

const IntroReVerification = ({ styles, firstName, ready, onVerify, onLearnMore }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
          {firstName ? `${firstName},` : ``}
          <Section.Text fontWeight="bold" textTransform="none" color="#00AEFF" fontSize={30} lineHeight={30}>
            {firstName ? `\n` : ''}
            {t`It’s time to update
  your Face Verification!`}
            {`\n`}
          </Section.Text>
        </Section.Title>
        <Section>
          <Section.Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18}>
            {t`Every so often, it's necessary to double-check that you're still you. You’ll go through the same verification process you went through when you first signed up for GoodDollar.`}
          </Section.Text>
          <Section.Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
            {t`You’ll be able to claim once this process is complete.`}
          </Section.Text>
        </Section>
        <View style={styles.illustration}>
          <Image source={BillyVerifies} resizeMode="center" style={{ width: 160, height: 160, marginLeft: 'auto' }} />
        </View>
        <Section.Text
          fontWeight="bold"
          fontSize={18}
          lineHeight={26}
          textDecorationLine="underline"
          style={styles.learnMore}
          onPress={onLearnMore}
        >
          {t`Learn More`}
        </Section.Text>
        <CustomButton style={[styles.button]} onPress={onVerify} disabled={!ready}>
          {t`Continue`}
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const Intro = ({ styles, firstName, ready, onVerify, onLearnMore }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
          {firstName ? `${firstName},` : ``}
          <Section.Text fontWeight="regular" textTransform="none" fontSize={24} lineHeight={30}>
            {firstName ? `\n` : ''}
            {t`Verify you are a real live person`}
            {`\n`}
          </Section.Text>
        </Section.Title>
        <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
          {t`Your image is only used to prevent the creation of duplicate accounts and will never be transferred to any third party`}
        </Section.Text>
        <Section.Text
          fontWeight="bold"
          fontSize={18}
          lineHeight={26}
          textDecorationLine="underline"
          style={styles.learnMore}
          onPress={onLearnMore}
        >
          {t`Learn More`}
        </Section.Text>
        <View style={styles.illustration}>
          <FashionShootSVG />
        </View>
        <CustomButton style={[styles.button]} onPress={onVerify} disabled={!ready}>
          {t`OK, VERIFY ME`}
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const IntroScreen = ({ styles, screenProps, navigation }) => {
  const { fullName } = useProfile()
  const { showDialog } = useDialog()

  const { account: externalAccount, isDelta, firstName, isFVFlow, isFVFlowReady } = useContext(FVFlowContext)
  const goodWallet = useWallet()
  const { account } = goodWallet ?? {}
  const [expiryDate, , state] = useIdentityExpiryDate(externalAccount || account)

  const { goToRoot, navigateTo, push } = screenProps
  const fvRedirect = useFVRedirect()
  const { faceIdentifier: enrollmentIdentifier, v1FaceIdentifier: fvSigner } = useEnrollmentIdentifier()
  const userName = useMemo(
    () => (firstName ? (isFVFlow ? firstName : getFirstWord(fullName)) : ''),
    [isFVFlow, firstName, fullName],
  )

  const [disposing, checkDisposalState] = useDisposingState(
    {
      requestOnMounted: false,
      enrollmentIdentifier,
      fvSigner,
      onComplete: isDisposing => {
        if (!isDisposing) {
          return
        }

        const dialogData = showQueueDialog(WalletDeletedPopupText, true, {
          onDismiss: isFVFlow ? () => fvRedirect(false, 'Wait 24 hours') : goToRoot,
          imageSource: Wait24HourSVG,
        })

        showDialog(dialogData)
      },
    },
    [enrollmentIdentifier],
  )

  const openPrivacy = useOnPress(() => openLink(Config.faceVerificationPrivacyUrl), [])
  const openFaceVerification = useCallback(() => push('FaceVerification'), [push])

  const [, requestCameraPermissions] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    onAllowed: openFaceVerification,
    onPrompt: () => fireEvent(FV_CAMERAPERMISSION),
    onDenied: () => fireEvent(FV_CANTACCESSCAMERA),
    navigate: navigateTo,
  })

  const [, checkForCameraSupport] = useCameraSupport({
    checkOnMounted: false,
    onSupported: requestCameraPermissions,
    onUnsupported: () => {
      requestCameraPermissions({ ignoreMountedState: true }) // we let the user try anyways. we add ignoreMOuntedState because when showing the unsupportedbrowser popup it unmounts
    },
    unsupportedPopup: UnsupportedWebview,
    onCheck: () => !isDelta || (!isWebView && (!isIOSWeb || iosSupportedWeb)),
  })

  const handleVerifyClick = useCallback(async () => {
    const isDeviceEmulated = await isEmulator

    // if cypress is running - just redirect to FR as we're skipping
    // zoom component (which requires camera access) in this case
    if (isDeviceEmulated) {
      openFaceVerification()
      return
    }

    checkForCameraSupport()
  }, [checkForCameraSupport])

  useFaceTecSDK({ initOnMounted: true }) // early initialize

  useEffect(() => {
    log.debug({ enrollmentIdentifier, userName, isFVFlow, isFVFlowReady })

    AsyncStorage.setItem('hasStartedFV', 'true')

    if (enrollmentIdentifier && (!isFVFlow || isFVFlowReady)) {
      fireEvent(FV_INTRO)
      checkDisposalState()
    }
  }, [enrollmentIdentifier, isFVFlow, isFVFlowReady, navigateTo, checkDisposalState])

  useFVLoginInfoCheck(navigation)

  if (state === 'pending') {
    return (
      <View display="flex" justifyContent="center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!expiryDate?.lastAuthenticated?.isZero()) {
    return (
      <IntroReVerification
        styles={styles}
        firstName={userName}
        onLearnMore={openPrivacy}
        onVerify={handleVerifyClick}
        ready={false === disposing}
      />
    )
  }

  return (
    <Intro
      styles={styles}
      firstName={userName}
      onLearnMore={openPrivacy}
      onVerify={handleVerifyClick}
      ready={false === disposing}
    />
  )
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(isSmallDevice ? 10 : theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(isSmallDevice ? 10 : theme.sizes.defaultDouble),
    marginBottom: theme.paddings.bottomPadding,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    width: '100%',
  },
  mainTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 16 : 8),
  },
  mainText: {
    marginTop: getDesignRelativeHeight(20),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(20),
    marginBottom: getDesignRelativeHeight(31),
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 160,
    height: 160,
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isSmallDevice ? 8 : 14),
  },
  descriptionUnderline: {
    display: Platform.select({ web: 'block', default: 'flex' }),
    paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultQuadruple : theme.sizes.defaultDouble),
  },
  button: {
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(isSmallDevice ? theme.sizes.defaultDouble : 25),
  },
  learnMore: {
    color: theme.colors.primary,
    marginTop: getDesignRelativeHeight(isSmallDevice ? theme.sizes.defaultDouble : 20),
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
