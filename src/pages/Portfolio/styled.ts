import styled from 'styled-components'
import { TitleSC } from '../../components/gd/Title'
import { ButtonDefault } from '../../components/gd/Button'
import Table, { TableSC } from '../../components/gd/Table'

export const PortfolioTitleSC = styled.div`
    font-style: normal;
    font-weight: 900;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.1px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.text6};

    @media ${({ theme }) => theme.media.md} {
        font-size: 12px;
        line-height: 24px;

        &.claimable-rewards {
            margin-bottom: 10px;
            br {
                display: none;
            }
        }
    }
`

export const PortfolioValueSC = styled.div`
    font-style: normal;
    font-weight: bold;
    font-size: 24px;
    line-height: 32px;
    color: ${({ theme }) => theme.color.text6};

    @media ${({ theme }) => theme.media.md} {
        font-size: 16px;
        line-height: 32px;
        margin-bottom: 10px;
    }
`

export const PortfolioAnalyticSC = styled.div`
    height: 72px;

    ${TitleSC}.category {
        line-height: 14px;
    }

    @media ${({ theme }) => theme.media.md} {
        flex-wrap: wrap;
        height: unset;

        > * {
            width: 100%;
        }

        ${ButtonDefault} {
            width: 100%;
        }
    }
`

export const PortfolioSC = styled.div`
    @media screen and (max-width: 1250px) {
        ${TableSC} {
            th:nth-child(3),
            td:nth-child(3) {
                display: none;
            }
        }
    }

    @media screen and (max-width: 1170px) {
        ${TableSC} {
            th:nth-child(5),
            td:nth-child(5),
            th:nth-child(6),
            td:nth-child(6) {
                display: none;
            }
        }
    }

    @media ${({ theme }) => theme.media.md} {
        ${TableSC} ${TitleSC} {
            font-size: 10px;
        }

        ${TableSC} {
            th:nth-child(1),
            td:nth-child(1),
            th:nth-child(8),
            td:nth-child(8) {
                display: none;
            }

            td:nth-child(2) {
                border-left: 1px solid ${({ theme }) => theme.color.border2};
                border-top-left-radius: 12px;
            }

            td:nth-child(7) {
                border-right: 1px solid ${({ theme }) => theme.color.border2};
                border-top-right-radius: 12px;
            }

            tr.mobile ${ButtonDefault} {
                width: 100%;
            }
        }
    }
`
