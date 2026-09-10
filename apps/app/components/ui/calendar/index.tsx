'use client'

import {
  createCalendar,
  type ICalendarProps,
} from '@gluestack-ui/core/calendar/creator'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

import { Menu, MenuItem, MenuItemLabel } from '../menu'
import {
  calendarBodyStyle,
  calendarDayIndicatorStyle,
  calendarDayStyle,
  calendarDayTextStyle,
  calendarFooterStyle,
  calendarGridStyle,
  calendarHeaderButtonStyle,
  calendarHeaderSelectStyle,
  calendarHeaderStyle,
  calendarHeaderTitleStyle,
  calendarStyle,
  calendarWeekDaysHeaderStyle,
  calendarWeekDayStyle,
  calendarWeekDayTextStyle,
  calendarWeekNumberStyle,
  calendarWeekNumberTextStyle,
  calendarWeekStyle,
} from './styles'

// Styled Root Component
const CalendarRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  ICalendarProps & React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarStyle({ class: className })}
      {...props}
    />
  )
})
CalendarRoot.displayName = 'CalendarRoot'

// Styled Header
const CalendarHeaderRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarHeaderStyle({ class: className })}
      {...props}
    />
  )
})
CalendarHeaderRoot.displayName = 'CalendarHeaderRoot'

const CalendarHeaderPrevButtonRoot = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentProps<typeof Pressable> & {
    className?: string
    disabled?: boolean
  }
>(({ className, disabled, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      className={calendarHeaderButtonStyle({ class: className })}
      data-disabled={disabled}
      {...props}
    />
  )
})
CalendarHeaderPrevButtonRoot.displayName = 'CalendarHeaderPrevButtonRoot'

const CalendarHeaderNextButtonRoot = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentProps<typeof Pressable> & {
    className?: string
    disabled?: boolean
  }
>(({ className, disabled, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      className={calendarHeaderButtonStyle({ class: className })}
      data-disabled={disabled}
      {...props}
    />
  )
})
CalendarHeaderNextButtonRoot.displayName = 'CalendarHeaderNextButtonRoot'

const CalendarHeaderTitleRoot = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentProps<typeof Text> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={calendarHeaderTitleStyle({ class: className })}
      {...props}
    />
  )
})
CalendarHeaderTitleRoot.displayName = 'CalendarHeaderTitleRoot'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

type SelectRootProps = React.ComponentProps<typeof View> & {
  className?: string
  items?: Array<{ label: string; value: number }>
  selectedValue?: number
  onValueChange?: (value: number) => void
}

const CalendarHeaderMonthSelectRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  SelectRootProps
>(({ className, items = [], selectedValue, onValueChange, ...props }, ref) => {
  const label =
    selectedValue !== undefined ? MONTH_NAMES[selectedValue] : 'Month'
  return (
    <View
      ref={ref}
      className={calendarHeaderSelectStyle({ class: className })}
      {...props}
    >
      <Menu
        placement="bottom"
        offset={4}
        trigger={({ ...triggerProps }) => (
          <Pressable
            {...triggerProps}
            className="px-2 py-1 rounded-md flex-row items-center"
          >
            <Text className="text-sm font-medium text-foreground">{label}</Text>
          </Pressable>
        )}
      >
        {items.map((item) => (
          <MenuItem
            key={item.value}
            textValue={item.label}
            onPress={() => onValueChange?.(item.value)}
          >
            <MenuItemLabel
              className={
                item.value === selectedValue ? 'text-primary font-semibold' : ''
              }
            >
              {item.label}
            </MenuItemLabel>
          </MenuItem>
        ))}
      </Menu>
    </View>
  )
})
CalendarHeaderMonthSelectRoot.displayName = 'CalendarHeaderMonthSelectRoot'

const CalendarHeaderYearSelectRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  SelectRootProps
>(({ className, items = [], selectedValue, onValueChange, ...props }, ref) => {
  const label = selectedValue !== undefined ? String(selectedValue) : 'Year'
  return (
    <View
      ref={ref}
      className={calendarHeaderSelectStyle({ class: className })}
      {...props}
    >
      <Menu
        placement="bottom"
        offset={4}
        trigger={({ ...triggerProps }) => (
          <Pressable
            {...triggerProps}
            className="px-2 py-1 rounded-md flex-row items-center"
          >
            <Text className="text-sm font-medium text-foreground">{label}</Text>
          </Pressable>
        )}
      >
        {items.map((item) => (
          <MenuItem
            key={item.value}
            textValue={item.label}
            onPress={() => onValueChange?.(item.value)}
          >
            <MenuItemLabel
              className={
                item.value === selectedValue ? 'text-primary font-semibold' : ''
              }
            >
              {item.label}
            </MenuItemLabel>
          </MenuItem>
        ))}
      </Menu>
    </View>
  )
})
CalendarHeaderYearSelectRoot.displayName = 'CalendarHeaderYearSelectRoot'

// Styled Week Days Header
const CalendarWeekDaysHeaderRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarWeekDaysHeaderStyle({ class: className })}
      {...props}
    />
  )
})
CalendarWeekDaysHeaderRoot.displayName = 'CalendarWeekDaysHeaderRoot'

const CalendarWeekDayRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarWeekDayStyle({ class: className })}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={calendarWeekDayTextStyle({ class: '' })}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
})
CalendarWeekDayRoot.displayName = 'CalendarWeekDayRoot'

// Styled Body & Grid
const CalendarBodyRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarBodyStyle({ class: className })}
      {...props}
    />
  )
})
CalendarBodyRoot.displayName = 'CalendarBodyRoot'

const CalendarGridRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarGridStyle({ class: className })}
      {...props}
    />
  )
})
CalendarGridRoot.displayName = 'CalendarGridRoot'

const CalendarWeekRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarWeekStyle({ class: className })}
      {...props}
    />
  )
})
CalendarWeekRoot.displayName = 'CalendarWeekRoot'

// Styled Day
const CalendarDayRoot = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentProps<typeof Pressable> & {
    className?: string
    'data-state'?: string
  }
>(({ className, 'data-state': dataState, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      className={calendarDayStyle({
        // oxlint-disable-next-line typescript/no-explicit-any
        state: dataState as any,
        class: className,
      })}
      {...props}
    />
  )
})
CalendarDayRoot.displayName = 'CalendarDayRoot'

const CalendarDayTextRoot = React.forwardRef<
  React.ElementRef<typeof Text>,
  // oxlint-disable-next-line typescript/no-explicit-any
  React.ComponentProps<typeof Text> & { className?: string; state?: any }
>(({ className, state, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={calendarDayTextStyle({
        state:
          state?.isSelected && state?.isRangeStart
            ? 'range-start'
            : state?.isSelected && state?.isRangeEnd
              ? 'range-end'
              : state?.isInRange
                ? 'range-middle'
                : state?.isSelected
                  ? 'selected'
                  : state?.isToday
                    ? 'today'
                    : state?.isDisabled
                      ? 'disabled'
                      : state?.isOutsideMonth
                        ? 'outside-month'
                        : 'default',
        class: className,
      })}
      {...props}
    />
  )
})
CalendarDayTextRoot.displayName = 'CalendarDayTextRoot'

const CalendarDayIndicatorRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & {
    className?: string
    'data-type'?: string
  }
>(({ className, 'data-type': dataType, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarDayIndicatorStyle({
        // oxlint-disable-next-line typescript/no-explicit-any
        type: dataType as any,
        class: className,
      })}
      {...props}
    />
  )
})
CalendarDayIndicatorRoot.displayName = 'CalendarDayIndicatorRoot'

// Styled Week Number
const CalendarWeekNumberRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarWeekNumberStyle({ class: className })}
      {...props}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text className={calendarWeekNumberTextStyle({ class: '' })}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
})
CalendarWeekNumberRoot.displayName = 'CalendarWeekNumberRoot'

// Styled Footer
const CalendarFooterRoot = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={calendarFooterStyle({ class: className })}
      {...props}
    />
  )
})
CalendarFooterRoot.displayName = 'CalendarFooterRoot'

// Create Calendar using the factory
const UICalendar = createCalendar({
  Root: CalendarRoot,
  Header: CalendarHeaderRoot,
  HeaderPrevButton: CalendarHeaderPrevButtonRoot,
  HeaderNextButton: CalendarHeaderNextButtonRoot,
  HeaderTitle: CalendarHeaderTitleRoot,
  HeaderMonthSelect: CalendarHeaderMonthSelectRoot,
  HeaderYearSelect: CalendarHeaderYearSelectRoot,
  WeekDaysHeader: CalendarWeekDaysHeaderRoot,
  WeekDay: CalendarWeekDayRoot,
  Body: CalendarBodyRoot,
  Grid: CalendarGridRoot,
  Week: CalendarWeekRoot,
  Day: CalendarDayRoot,
  DayText: CalendarDayTextRoot,
  DayIndicator: CalendarDayIndicatorRoot,
  WeekNumber: CalendarWeekNumberRoot,
  Footer: CalendarFooterRoot,
})

// Mode-specific discriminated union props so onValueChange is correctly
// narrowed per mode (prevents TypeScript errors when passing setState).
type OmittedCalendarKeys = 'mode' | 'value' | 'defaultValue' | 'onValueChange'

type SingleModeProps = {
  mode?: 'single'
  value?: Date
  defaultValue?: Date
  onValueChange?: (value: Date) => void
}

type MultipleModeProps = {
  mode: 'multiple'
  value?: Array<Date>
  defaultValue?: Array<Date>
  onValueChange?: (value: Array<Date>) => void
}

type RangeModeProps = {
  mode: 'range'
  value?: { from: Date; to?: Date }
  defaultValue?: { from: Date; to?: Date }
  onValueChange?: (value: { from: Date; to?: Date }) => void
}

type CalendarProps = (SingleModeProps | MultipleModeProps | RangeModeProps) &
  Omit<ICalendarProps, OmittedCalendarKeys> &
  Omit<React.ComponentProps<typeof View>, OmittedCalendarKeys> & {
    className?: string
  }

const CalendarComponent = React.forwardRef<
  React.ElementRef<typeof View>,
  CalendarProps
>((props, ref) => {
  // oxlint-disable-next-line typescript/no-explicit-any
  return <UICalendar ref={ref} {...(props as any)} />
})
CalendarComponent.displayName = 'Calendar'

// Export components
export const Calendar = CalendarComponent
export const CalendarHeader = UICalendar.Header
export const CalendarHeaderPrevButton = UICalendar.HeaderPrevButton
export const CalendarHeaderNextButton = UICalendar.HeaderNextButton
export const CalendarHeaderTitle = UICalendar.HeaderTitle
export const CalendarHeaderMonthSelect = UICalendar.HeaderMonthSelect
export const CalendarHeaderYearSelect = UICalendar.HeaderYearSelect
export const CalendarWeekDaysHeader = UICalendar.WeekDaysHeader
export const CalendarWeekDay = UICalendar.WeekDay
export const CalendarBody = UICalendar.Body
export const CalendarGrid = UICalendar.Grid
export const CalendarWeek = UICalendar.Week
export const CalendarDay = UICalendar.Day
export const CalendarDayText = UICalendar.DayText
export const CalendarDayIndicator = UICalendar.DayIndicator
export const CalendarWeekNumber = UICalendar.WeekNumber
export const CalendarFooter = UICalendar.Footer

// Re-export types
export type {
  CalendarMarker,
  CalendarMarkers,
  CalendarMode,
  DayState,
  ICalendarProps,
} from '@gluestack-ui/core/calendar/creator'

export type { CalendarProps }
