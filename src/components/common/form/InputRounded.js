import React from 'react'
import { TextInput, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Icon from 'react-native-elements/src/icons/Icon'
import { HelperText } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const InputRounded = ({ styles, theme, icon, iconColor, error, onChange, ...inputProps }) => {
  const handleChange = event => {
    onChange(event.target.value)
  }

  return (
    <View style={styles.inputContainer}>
      <View
        style={inputProps.disabled ? styles.inputText : error ? styles.errorInputContainer : styles.iconInputContainer}
      >
        <TextInput style={styles.input} {...inputProps} onChange={handleChange} />
        <View style={styles.suffixIcon}>
          <Icon size={normalize(16)} color={iconColor || theme.colors.gray50Percent} name={icon} />
        </View>
      </View>
      <HelperText type="error" visible={error} style={styles.error}>
        {error}
      </HelperText>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const defaultInputContainer = {
    position: 'relative',
    paddingHorizontal: normalize(40),
    paddingVertical: 0,
  }
  return {
    inputContainer: {
      display: 'inline-flex',
      flex: 1,
    },
    errorInputContainer: {
      ...defaultInputContainer,
      borderRadius: normalize(24),
      borderWidth: 1,
      borderColor: theme.colors.red,
    },
    iconInputContainer: {
      ...defaultInputContainer,
      borderRadius: normalize(24),
      borderWidth: 1,
      borderColor: theme.colors.gray50Percent,
    },
    inputText: {
      ...defaultInputContainer,
      borderBottomColor: theme.colors.gray50Percent,
      borderBottomWidth: 1,
    },
    input: {
      flex: 1,
      backgroundColor: 'inherit',
      border: 0,
      lineHeight: normalize(36),
      fontSize: normalize(14),
    },
    suffixIcon: {
      position: 'absolute',
      right: normalize(24),
      paddingTop: theme.paddings.mainContainerPadding,
      zIndex: 1,
    },
    error: {
      paddingRight: 0,
      textAlign: 'left',
    },
  }
}

export default withStyles(getStylesFromProps)(InputRounded)
