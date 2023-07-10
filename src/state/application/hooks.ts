import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AsyncStorage } from '@gooddollar/web3sdk-v2'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { AppDispatch, AppState } from '../index'
import { addPopup, removePopup, setChain, setOpenModal, setTheme as setThemeAction } from './actions'
import { ApplicationModal, PopupContent, ApplicationState } from './types'
import { useColorMode } from 'native-base'

export function useBlockNumber(): number | undefined {
    const { chainId } = useActiveWeb3React()

    return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useSelectedChain() {
    const dispatch = useDispatch<AppDispatch>()
    const setSelectedChain = useCallback((chainId: number) => dispatch(setChain(chainId)), [dispatch, setChain])
    return { selectedChain: useSelector((state: AppState) => state.application.selectedChain), setSelectedChain }
}

export function useModalOpen(modal: ApplicationModal): boolean {
    const openModal = useSelector((state: AppState) => state.application.openModal)
    return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
    const open = useModalOpen(modal)
    const dispatch = useDispatch<AppDispatch>()
    return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
    const dispatch = useDispatch<AppDispatch>()
    return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
    const dispatch = useDispatch<AppDispatch>()
    return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useWalletModalToggle(): () => void {
    return useToggleModal(ApplicationModal.WALLET)
}

export function useNetworkModalToggle(): () => void {
    return useToggleModal(ApplicationModal.NETWORK)
}

export function useToggleSettingsMenu(): () => void {
    return useToggleModal(ApplicationModal.SETTINGS)
}

export function useShowClaimPopup(): boolean {
    return useModalOpen(ApplicationModal.CLAIM_POPUP)
}

export function useToggleShowClaimPopup(): () => void {
    return useToggleModal(ApplicationModal.CLAIM_POPUP)
}

export function useToggleSelfClaimModal(): () => void {
    return useToggleModal(ApplicationModal.SELF_CLAIM)
}

export function useToggleDelegateModal(): () => void {
    return useToggleModal(ApplicationModal.DELEGATE)
}

export function useToggleVoteModal(): () => void {
    return useToggleModal(ApplicationModal.VOTE)
}

export function useFaucetModalToggle(): () => void {
    return useToggleModal(ApplicationModal.FAUCET)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
    const dispatch = useDispatch()

    return useCallback(
        (content: PopupContent, key?: string) => {
            dispatch(addPopup({ content, key }))
        },
        [dispatch]
    )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
    const dispatch = useDispatch()
    return useCallback(
        (key: string) => {
            dispatch(removePopup({ key }))
        },
        [dispatch]
    )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
    const list = useSelector((state: AppState) => state.application.popupList)
    return useMemo(() => list.filter((item) => item.show), [list])
}

export function useKashiApprovalPending(): string {
    return useSelector((state: AppState) => state.application.kashiApprovalPending)
}

export function useApplicationTheme(): readonly ['light' | 'dark', (theme: ApplicationState['theme']) => void] {
    const { setColorMode } = useColorMode()
    const dispatch = useDispatch()
    const theme = useSelector((state: AppState) => state.application.theme)

    const setTheme = useCallback(
        (theme: ApplicationState['theme']) => {
            dispatch(setThemeAction(theme))
            setColorMode(theme)
        },
        [dispatch, setColorMode]
    )

    useEffect(() => {
        void AsyncStorage.getItem('application.theme').then(setTheme)
    }, [setTheme])

    return [theme, setTheme] as const
}
