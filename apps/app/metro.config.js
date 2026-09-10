import { getDefaultConfig } from 'expo/metro-config'
import { withNativewind } from 'nativewind/metro'

const config = getDefaultConfig(__dirname)

export default withNativewind(config, { inlineRem: 16 })
