import React, { useState } from "react"
import { View, StyleProp, TextStyle, ViewStyle, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated"
import { Svg, Circle } from "react-native-svg"
import { Text } from "app/components/Text"
import { spacing } from "app/theme"

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export interface ProgressDisplayProps {
  preset?: "linearProgress" | "circularProgress"
  progress: number

  // Linear Progress specific props
  linearStyle?: StyleProp<ViewStyle>

  // Circular Progress specific props
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  outerCircleColor?: string
  progressCircleColor?: string
  labelColor?: string
  labelStyle?: StyleProp<TextStyle>
  labelSize?: number
}

export const Progress = observer(function ProgressDisplay(props: ProgressDisplayProps) {
  const {
    preset = "linearProgress",
    progress,
    linearStyle,
    size = 80,
    strokeWidth = (5 * size) / 100,
    showLabel = true,
    labelSize = (20 * size) / 100,
    labelColor = "white",
    outerCircleColor = "white",
    progressCircleColor = "dodgerblue",
    labelStyle,
  } = props

  if (preset === "circularProgress") {
    const radius = (size - strokeWidth) / 2
    const circum = radius * 2 * Math.PI
    const [LabelText, SetLabelText] = useState(0)

    const derivedProgressValue = useDerivedValue(() => {
      if (showLabel) runOnJS(SetLabelText)(Math.min(progress, 100))
      return withTiming(progress)
    }, [progress])

    const circleAnimatedProps = useAnimatedProps(() => {
      const SVG_Progress = interpolate(
        derivedProgressValue.value,
        [0, 100],
        [100, 0],
      )

      return {
        strokeDashoffset: radius * Math.PI * 2 * (SVG_Progress / 100),
      }
    })

    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <Circle
            stroke={outerCircleColor}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />

          <AnimatedCircle
            stroke={progressCircleColor}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={`${circum} ${circum}`}
            strokeLinecap="round"
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
            strokeWidth={strokeWidth}
            animatedProps={circleAnimatedProps}
          />
        </Svg>
        {showLabel && (
          <View style={[styles.labelView, { width: size, height: size }]}>
            <Animated.Text style={[{ color: labelColor, fontSize: labelSize }, labelStyle]}>
              {`${LabelText}%`}
            </Animated.Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.linearContainer, linearStyle]}>
      <View style={styles.linearBar}>
        <View style={[styles.linearFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.linearText}>{progress}%</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  labelView: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  linearContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  linearBar: {
    backgroundColor: "#0e1829",
    borderRadius: spacing.xxs,
    flex: 1,
    height: spacing.xs,
  },
  linearFill: {
    backgroundColor: "#1d3255",
    borderRadius: spacing.xxxs,
    height: "100%",
  },
  linearText: {
    color: "#9CA3AF",
    fontSize: spacing.md,
    marginLeft: spacing.sm,
  },
})
