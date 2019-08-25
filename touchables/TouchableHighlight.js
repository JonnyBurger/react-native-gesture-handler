import React, { Component } from 'react';
import GenericTouchable, { TOUCHABLE_STATE } from './GenericTouchable';
import { StyleSheet, View, Animated } from 'react-native';
import PropTypes from 'prop-types';

/**
 * TouchableHighlight follows RN's implementation
 */
export default class TouchableHighlight extends Component {
	static defaultProps = {
		...GenericTouchable.defaultProps,
		activeOpacity: 0.85,
		delayPressOut: 100,
		underlayColor: 'black'
	};

	static propTypes = {
		...GenericTouchable.publicPropTypes,
		activeOpacity: PropTypes.number,
		underlayColor: PropTypes.string,
		style: PropTypes.any,
		onShowUnderlay: PropTypes.func,
		onHideUnderlay: PropTypes.func
	};

	constructor(props) {
		super(props);
		this.state = {
			extraChildStyle: null,
			extraUnderlayStyle: null
		};
	}

	pressedIn = new Animated.Value(0);

	// Copied from RN
	showUnderlay = () => {
		if (!this.hasPressHandler()) {
			return;
		}
		Animated.timing(this.pressedIn, {
			toValue: 1,
			duration: 0,
			useNativeDriver: true,
		}).start();
		this.props.onShowUnderlay && this.props.onShowUnderlay();
	};

	hasPressHandler = () =>
		this.props.onPress ||
		this.props.onPressIn ||
		this.props.onPressOut ||
		this.props.onLongPress;

	hideUnderlay = () => {
		Animated.timing(this.pressedIn, {
			toValue: 0,
			duration: 0,
			useNativeDriver: true,
		}).start();
		this.props.onHideUnderlay && this.props.onHideUnderlay();
	};

	renderChildren() {
		if (!this.props.children) {
			return <View />;
		}

		const child = React.Children.only(this.props.children);
		return React.cloneElement(child, {
			style: StyleSheet.compose(
				child.props.style,
				this.state.extraChildStyle
			)
		});
	}

	onStateChange = (from, to) => {
		if (to === TOUCHABLE_STATE.BEGAN) {
			this.showUnderlay();
		} else if (
			to === TOUCHABLE_STATE.UNDETERMINED ||
			to === TOUCHABLE_STATE.MOVED_OUTSIDE
		) {
			this.hideUnderlay();
		}
	};

	render() {
		const { style = {}, ...rest } = this.props;
		const { extraUnderlayStyle } = this.state;
		return (
			<GenericTouchable
				{...rest}
				style={[style, {
					backgroundColor: this.pressedIn.interpolate({
						inputRange: [0, 1],
						outputRange: ['rgba(255, 255, 255, 0)', this.props.underlayColor]
					})
				}]}
				onStateChange={this.onStateChange}
			>
				{this.renderChildren()}
			</GenericTouchable>
		);
	}
}
