import {
    FlatList,
    type FlatListProps,
    type ListRenderItem as FlastListRenderItem,
    type ListRenderItemInfo,
} from "react-native";
import { cva } from "class-variance-authority";
import { cssInterop } from "nativewind";
import * as React from "react";
import {
    Platform,
    PressableProps,
    StyleSheet,
    View,
    ViewProps,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, TextClassContext } from "@/components/nativewindui/Text";
import { Button } from "@/components/nativewindui/Button";
import { cn } from "@/lib/cn";

cssInterop(FlatList, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
});

type ListDataItem = string | { title: string; subTitle?: string };
type ListVariant = "insets" | "full-width";

type ListRef<T extends ListDataItem> = React.Ref<FlatList<T>>;

type ListRenderItemProps<T extends ListDataItem> = ListRenderItemInfo<T> & {
    variant?: ListVariant;
    isFirstInSection?: boolean;
    isLastInSection?: boolean;
    sectionHeaderAsGap?: boolean;
};

type ListProps<T extends ListDataItem> = Omit<
    FlatListProps<T>,
    "renderItem"
> & {
    renderItem?: ListRenderItem<T>;
    variant?: ListVariant;
    sectionHeaderAsGap?: boolean;
    rootClassName?: string;
};
type ListRenderItem<T extends ListDataItem> = (
    props: ListRenderItemProps<T>
) => ReturnType<FlastListRenderItem<T>>;

const rootVariants = cva("min-h-2 flex-1", {
    variants: {
        variant: {
            insets: "ios:px-4",
            "full-width": "ios:bg-card ios:dark:bg-background",
        },
        sectionHeaderAsGap: {
            true: "",
            false: "",
        },
    },
    compoundVariants: [
        {
            variant: "full-width",
            sectionHeaderAsGap: true,
            className: "bg-card dark:bg-background",
        },
    ],
    defaultVariants: {
        variant: "full-width",
        sectionHeaderAsGap: false,
    },
});

function ListComponent<T extends ListDataItem>(
    {
        variant = "full-width",
        rootClassName,
        contentContainerClassName,
        renderItem,
        data,
        sectionHeaderAsGap = false,
        ...props
    }: ListProps<T>,
    ref: ListRef<T>
) {
    const insets = useSafeAreaInsets();
    return (
        <View
            className={rootVariants({
                variant,
                sectionHeaderAsGap,
                className: rootClassName,
            })}
        >
            <FlatList
                data={data}
                renderItem={renderItemWithVariant(
                    renderItem,
                    variant,
                    data,
                    sectionHeaderAsGap
                )}
                contentContainerClassName={cn(
                    variant === "insets" &&
                        (!data || (typeof data?.[0] !== "string" && "pt-4")),
                    contentContainerClassName
                )}
                contentContainerStyle={{
                    paddingBottom: Platform.select({
                        ios:
                            !props.contentInsetAdjustmentBehavior ||
                            props.contentInsetAdjustmentBehavior === "never"
                                ? insets.bottom + 16
                                : 0,
                        default: insets.bottom,
                    }),
                }}
                showsVerticalScrollIndicator={false}
                {...props}
                ref={ref}
            />
        </View>
    );
}

function getItemType<T>(item: T) {
    return typeof item === "string" ? "sectioHeader" : "row";
}

function renderItemWithVariant<T extends ListDataItem>(
    renderItem: ListRenderItem<T> | null | undefined,
    variant: ListVariant,
    data: ArrayLike<T> | null | undefined,
    sectionHeaderAsGap?: boolean
) {
    return (args: ListRenderItemProps<T>) => {
        const previousItem = data?.[args.index - 1];
        const nextItem = data?.[args.index + 1];
        return renderItem
            ? renderItem({
                  ...args,
                  variant,
                  isFirstInSection:
                      !previousItem || typeof previousItem === "string",
                  isLastInSection: !nextItem || typeof nextItem === "string",
                  sectionHeaderAsGap,
              })
            : null;
    };
}

const List = React.forwardRef(ListComponent) as <T extends ListDataItem>(
    props: ListProps<T> & { ref?: ListRef<T> }
) => React.ReactElement;

function isPressable(props: PressableProps) {
    return (
        "onPress" in props ||
        "onLongPress" in props ||
        "onPressIn" in props ||
        "onPressOut" in props ||
        "onLongPress" in props
    );
}

type ListItemProps<T extends ListDataItem> = PressableProps &
    ListRenderItemProps<T> & {
        textClassName?: string;
        textNumberOfLines?: number;
        subTitleClassName?: string;
        subTitleNumberOfLines?: number;
        textContentClassName?: string;
        leftView?: React.ReactNode;
        rightView?: React.ReactNode;
    };
type ListItemRef = React.Ref<View>;

const itemVariants = cva("ios:gap-0 flex-row gap-0 bg-card", {
    variants: {
        variant: {
            insets: "ios:bg-card bg-card/70",
            "full-width": "bg-card dark:bg-background",
        },
        sectionHeaderAsGap: {
            true: "",
            false: "",
        },
        isFirstItem: {
            true: "",
            false: "",
        },
        isFirstInSection: {
            true: "",
            false: "",
        },
        isLastInSection: {
            true: "border-border",
            false: "",
        },
        disabled: {
            true: "opacity-70",
            false: "opacity-100",
        },
    },
    compoundVariants: [
        {
            variant: "insets",
            sectionHeaderAsGap: true,
            className: "ios:dark:bg-card dark:bg-card/70",
        },
        {
            variant: "insets",
            isFirstInSection: true,
            className: "ios:rounded-t-[10px]",
        },
        {
            variant: "insets",
            isLastInSection: true,
            className: "ios:rounded-b-[10px]",
        },
        {
            variant: "full-width",
            isLastInSection: true,
            className: "ios:border-b ios:border-border ",
        },
        {
            variant: "insets",
            isFirstItem: true,
            className: "border-border/40 border-t",
        },
    ],
    defaultVariants: {
        variant: "insets",
        sectionHeaderAsGap: false,
        isFirstInSection: false,
        isLastInSection: false,
        disabled: false,
    },
});

function ListItemComponent<T extends ListDataItem>(
    {
        item,
        isFirstInSection,
        isLastInSection,
        index,
        variant,
        className,
        textClassName,
        textNumberOfLines,
        subTitleClassName,
        subTitleNumberOfLines,
        textContentClassName,
        sectionHeaderAsGap,
        leftView,
        rightView,
        disabled,
        ...props
    }: ListItemProps<T>,
    ref: ListItemRef
) {
    if (typeof item === "string") {
        console.log(
            "List.tsx",
            "ListItemComponent",
            "Invalid item of type 'string' was provided. Use ListSectionHeader instead."
        );
        return null;
    }
    return (
        <>
            <Button
                disabled={disabled || !isPressable(props)}
                variant="plain"
                size="none"
                unstable_pressDelay={100}
                className={itemVariants({
                    variant,
                    sectionHeaderAsGap,
                    isFirstInSection,
                    isLastInSection,
                    disabled,
                    className,
                })}
                style={Platform.select({
                    ios: undefined,
                    default: isLastInSection
                        ? { borderBottomWidth: StyleSheet.hairlineWidth }
                        : undefined,
                })}
                {...props}
                ref={ref}
            >
                <TextClassContext.Provider value="font-normal leading-5">
                    {!!leftView && <View>{leftView}</View>}
                    <View
                        className={cn(
                            "h-full flex-1 flex-row",
                            !item.subTitle
                                ? "ios:py-3 py-[18px]"
                                : "ios:py-2 py-2",
                            !leftView && "ml-4",
                            !rightView && "pr-4",
                            !isLastInSection && "ios:border-b ios:border-border"
                        )}
                    >
                        <View className={cn("flex-1", textContentClassName)}>
                            <Text
                                numberOfLines={textNumberOfLines}
                                className={textClassName}
                            >
                                {item.title}
                            </Text>
                            {!!item.subTitle && (
                                <Text
                                    numberOfLines={subTitleNumberOfLines}
                                    variant="subhead"
                                    className={cn(
                                        "text-muted-foreground",
                                        subTitleClassName
                                    )}
                                >
                                    {item.subTitle}
                                </Text>
                            )}
                        </View>
                        {!!rightView && <View>{rightView}</View>}
                    </View>
                </TextClassContext.Provider>
            </Button>
            {Platform.OS !== "ios" && !isLastInSection && (
                <View className={cn(variant === "insets" && "px-4")}>
                    <View
                        style={{ height: StyleSheet.hairlineWidth }}
                        className="bg-border"
                    />
                </View>
            )}
        </>
    );
}

const ListItem = React.forwardRef(ListItemComponent) as <
    T extends ListDataItem,
>(
    props: ListItemProps<T> & { ref?: ListItemRef }
) => React.ReactElement;

const LIST_SECTION: ViewStyle = Platform.select({
    ios: {},
    default: { borderBottomWidth: StyleSheet.hairlineWidth },
});

type ListSectionHeaderProps<T extends ListDataItem> = ViewProps &
    ListRenderItemProps<T> & {
        textClassName?: string;
    };
type ListSectionHeaderRef = React.Ref<View>;

function ListSectionHeaderComponent<T extends ListDataItem>(
    {
        item,
        isFirstInSection,
        isLastInSection,
        index,
        variant,
        className,
        textClassName,
        sectionHeaderAsGap,
        ...props
    }: ListSectionHeaderProps<T>,
    ref: ListSectionHeaderRef
) {
    if (typeof item !== "string") {
        console.log(
            "List.tsx",
            "ListSectionHeaderComponent",
            "Invalid item provided. Expected type 'string'. Use ListItem instead."
        );
        return null;
    }

    if (sectionHeaderAsGap) {
        return (
            <View
                style={LIST_SECTION}
                className={cn(
                    "bg-background",
                    variant === "full-width" ||
                        (Platform.OS !== "ios" && "border-b border-border"),
                    className
                )}
                {...props}
                ref={ref}
            >
                <View className="h-4" />
            </View>
        );
    }
    return (
        <View
            style={LIST_SECTION}
            className={cn(
                "ios:pb-1 border-border pb-4 pl-4 pt-4",
                variant === "full-width" && "border-b",
                variant === "full-width"
                    ? "bg-card dark:bg-background"
                    : "bg-background",
                className
            )}
            {...props}
            ref={ref}
        >
            <Text
                variant={Platform.select({ ios: "footnote", default: "body" })}
                className={cn(
                    "ios:uppercase ios:text-muted-foreground",
                    textClassName
                )}
            >
                {item}
            </Text>
        </View>
    );
}

const ListSectionHeader = React.forwardRef(ListSectionHeaderComponent) as <
    T extends ListDataItem,
>(
    props: ListSectionHeaderProps<T> & { ref?: ListSectionHeaderRef }
) => React.ReactElement;

const ESTIMATED_ITEM_HEIGHT = {
    titleOnly: Platform.select({ ios: 45, default: 57 }),
    withSubTitle: 56,
};

function getStickyHeaderIndices<T extends ListDataItem>(data: T[]) {
    if (!data) return [];
    const indices: number[] = [];
    for (let i = 0; i < data.length; i++) {
        if (typeof data[i] === "string") {
            indices.push(i);
        }
    }
    return indices;
}

export {
    ESTIMATED_ITEM_HEIGHT,
    List,
    ListItem,
    ListSectionHeader,
    getStickyHeaderIndices,
};
export type {
    ListDataItem,
    ListItemProps,
    ListProps,
    ListRenderItemInfo,
    ListSectionHeaderProps,
};
