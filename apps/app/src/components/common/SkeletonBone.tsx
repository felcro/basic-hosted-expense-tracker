import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Animated } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

const styles = StyleSheet.create({
  bone: {
    overflow: 'hidden',
  },
})

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

type SkeletonBoneProps = {
  width: number | `${number}%`
  height: number
  borderRadius?: number
}

export function SkeletonBone({
  width,
  height,
  borderRadius = 4,
}: SkeletonBoneProps) {
  const { theme } = useUnistyles()
  const [translateX] = useState(() => new Animated.Value(0))

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [translateX])

  return (
    <Animated.View
      style={[
        styles.bone,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.dimmed,
        },
      ]}
    >
      <AnimatedLinearGradient
        colors={['transparent', theme.colors.background, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-200, 200],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  )
}
