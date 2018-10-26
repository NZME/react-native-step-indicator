import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import styles from './StepIndicatorStyle';

const STEP_STATUS = {
  CURRENT: 'current',
  FINISHED: 'finished',
  UNFINISHED: 'unfinished',
};

export default class StepIndicator extends PureComponent {
  constructor(props) {
    super(props);

    const defaultStyles = {
      stepIndicatorSize: 30,
      currentStepIndicatorSize: 40,
      separatorStrokeWidth: 3,
      currentStepStrokeWidth: 5,
      stepStrokeWidth: 0,
      stepStrokeCurrentColor: '#4aae4f',
      stepStrokeFinishedColor: '#4aae4f',
      stepStrokeUnFinishedColor: '#4aae4f',
      separatorFinishedColor: '#4aae4f',
      separatorUnFinishedColor: '#a4d4a5',
      stepIndicatorFinishedColor: '#4aae4f',
      stepIndicatorUnFinishedColor: '#a4d4a5',
      stepIndicatorCurrentColor: '#ffffff',
      stepIndicatorLabelFontSize: 15,
      currentStepIndicatorLabelFontSize: 15,
      stepIndicatorLabelCurrentColor: '#000000',
      stepIndicatorLabelFinishedColor: '#ffffff',
      stepIndicatorLabelUnFinishedColor: 'rgba(255,255,255,0.5)',
      labelColor: '#000000',
      labelSize: 13,
      currentStepLabelColor: '#4aae4f',
    };
    const customStyles = Object.assign(defaultStyles, props.customStyles);

    this.state = {
      width: 0,
      height: 0,
      progressBarSize: 0,
      customStyles,
    };

    this.progressAnim = new Animated.Value(0);
    this.sizeAnim = new Animated.Value(
      this.state.customStyles.stepIndicatorSize,
    );
    this.borderRadiusAnim = new Animated.Value(
      this.state.customStyles.stepIndicatorSize / 2,
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.customStyles !== this.props.customStyles) {
      this.setState(state => ({
        customStyles: Object.assign(state.customStyles, nextProps.customStyles),
      }));
    }
    if (nextProps.currentPosition !== this.props.currentPosition) {
      this.onCurrentPositionChanged(nextProps.currentPosition);
    }
  }

  onCurrentPositionChanged = (position) => {
    const { stepCount } = this.props;
    const { progressBarSize, customStyles } = this.state;
    let _position = position;
    if (_position > stepCount - 1) {
      _position = stepCount - 1;
    }
    const animateToPosition = (progressBarSize / (stepCount - 1)) * position;
    this.sizeAnim.setValue(customStyles.stepIndicatorSize);
    this.borderRadiusAnim.setValue(customStyles.stepIndicatorSize / 2);
    Animated.sequence([
      Animated.timing(this.progressAnim, {
        toValue: animateToPosition,
        duration: 200,
      }),
      Animated.parallel([
        Animated.timing(this.sizeAnim, {
          toValue: customStyles.currentStepIndicatorSize,
          duration: 100,
        }),
        Animated.timing(this.borderRadiusAnim, {
          toValue: customStyles.currentStepIndicatorSize / 2,
          duration: 100,
        }),
      ]),
    ]).start();
  };

  getStepStatus = (stepPosition) => {
    const { currentPosition } = this.props;
    if (stepPosition === currentPosition) {
      return STEP_STATUS.CURRENT;
    } else if (stepPosition < currentPosition) {
      return STEP_STATUS.FINISHED;
    }
    return STEP_STATUS.UNFINISHED;
  };

  stepPressed(position) {
    if (this.props.onPress) {
      this.props.onPress(position);
    }
  }

  renderProgressBarBackground = () => {
    const { stepCount, direction, currentPosition } = this.props;
    const { width, height, customStyles } = this.state;
    let progressBarBackgroundStyle;
    if (direction === 'vertical') {
      progressBarBackgroundStyle = {
        backgroundColor: customStyles.separatorUnFinishedColor,
        position: 'absolute',
        left: (width - customStyles.separatorStrokeWidth) / 2,
        top: height / (2 * stepCount),
        bottom: height / (2 * stepCount),
        width: customStyles.separatorStrokeWidth,
      };
    } else {
      progressBarBackgroundStyle = {
        backgroundColor: customStyles.separatorUnFinishedColor,
        position: 'absolute',
        top: (height - customStyles.separatorStrokeWidth) / 2,
        left: width / (2 * stepCount),
        right: width / (2 * stepCount),
        height: customStyles.separatorStrokeWidth,
      };
    }
    return (
      <View
        onLayout={(event) => {
          if (direction === 'vertical') {
            this.setState(
              { progressBarSize: event.nativeEvent.layout.height },
              () => {
                this.onCurrentPositionChanged(currentPosition);
              },
            );
          } else {
            this.setState(
              { progressBarSize: event.nativeEvent.layout.width },
              () => {
                this.onCurrentPositionChanged(currentPosition);
              },
            );
          }
        }}
        style={progressBarBackgroundStyle}
      />
    );
  };

  renderProgressBar = () => {
    const { stepCount, direction } = this.props;
    const { width, height, customStyles } = this.state;
    let progressBarStyle;
    if (direction === 'vertical') {
      progressBarStyle = {
        backgroundColor: customStyles.separatorFinishedColor,
        position: 'absolute',
        left: (width - customStyles.separatorStrokeWidth) / 2,
        top: height / (2 * stepCount),
        bottom: height / (2 * stepCount),
        width: customStyles.separatorStrokeWidth,
        height: this.progressAnim,
      };
    } else {
      progressBarStyle = {
        backgroundColor: customStyles.separatorFinishedColor,
        position: 'absolute',
        top: (height - customStyles.separatorStrokeWidth) / 2,
        left: width / (2 * stepCount),
        right: width / (2 * stepCount),
        height: customStyles.separatorStrokeWidth,
        width: this.progressAnim,
      };
    }
    return <Animated.View style={progressBarStyle} />;
  };

  renderStepIndicator = () => {
    const steps = [];
    const { labels, stepCount, direction } = this.props;
    const { customStyles } = this.state;
    for (let position = 0; position < stepCount; position += 1) {
      steps.push(
        <TouchableWithoutFeedback
          key={position}
          onPress={() => this.stepPressed(position)}
        >
          <View
            style={[
              styles.stepContainer,
              direction === 'vertical'
                ? { flexDirection: 'column' }
                : { flexDirection: 'row' },
            ]}
          >
            {this.renderStep(position)}
          </View>
        </TouchableWithoutFeedback>,
      );
    }
    return (
      <View
        onLayout={event =>
          this.setState({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
          })
        }
        style={[
          styles.stepIndicatorContainer,
          direction === 'vertical'
            ? {
                flexDirection: 'column',
                width: customStyles.currentStepIndicatorSize,
              }
            : {
                flexDirection: 'row',
                height: customStyles.currentStepIndicatorSize,
              },
        ]}
      >
        {steps}
      </View>
    );
  };

  renderStepLabels = () => {
    const {
      labels, direction, currentPosition, labelTextStyle,
    } = this.props;
    const { customStyles } = this.state;
    const labelViews = labels.map((label, index) => {
      const selectedStepLabelStyle =
        index === currentPosition
          ? { color: customStyles.currentStepLabelColor }
          : { color: customStyles.labelColor };
      return (
        <TouchableWithoutFeedback
          style={styles.stepLabelItem}
          key={index}
          onPress={() => this.stepPressed(index)}
        >
          <View style={styles.stepLabelItem}>
            <Text
              style={[
                (labelTextStyle || styles.stepLabel),
                selectedStepLabelStyle,
                { fontSize: customStyles.labelSize },
              ]}
            >
              {label}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View
        style={[
          styles.stepLabelsContainer,
          direction === 'vertical'
            ? { flexDirection: 'column', paddingHorizontal: 4 }
            : { flexDirection: 'row', paddingVertical: 4 },
        ]}
      >
        {labelViews}
      </View>
    );
  };

  renderStep = (position) => {
    const {
      currentPosition,
      stepCount,
      direction,
      renderStepIndicator,
      showIndicatorLabel,
    } = this.props;
    const { customStyles } = this.state;
    let stepStyle;
    let indicatorLabelStyle;
    const separatorStyle =
      direction === 'vertical'
        ? { width: customStyles.separatorStrokeWidth, zIndex: 10 }
        : { height: customStyles.separatorStrokeWidth };
    switch (this.getStepStatus(position)) {
      case STEP_STATUS.CURRENT: {
        stepStyle = {
          backgroundColor: customStyles.stepIndicatorCurrentColor,
          borderWidth: customStyles.currentStepStrokeWidth,
          borderColor: customStyles.stepStrokeCurrentColor,
          height: this.sizeAnim,
          width: this.sizeAnim,
          borderRadius: this.borderRadiusAnim,
        };
        indicatorLabelStyle = {
          fontSize: customStyles.currentStepIndicatorLabelFontSize,
          color: customStyles.stepIndicatorLabelCurrentColor,
        };

        break;
      }
      case STEP_STATUS.FINISHED: {
        stepStyle = {
          backgroundColor: customStyles.stepIndicatorFinishedColor,
          borderWidth: customStyles.stepStrokeWidth,
          borderColor: customStyles.stepStrokeFinishedColor,
          height: customStyles.stepIndicatorSize,
          width: customStyles.stepIndicatorSize,
          borderRadius: customStyles.stepIndicatorSize / 2,
        };
        indicatorLabelStyle = {
          fontSize: customStyles.stepIndicatorLabelFontSize,
          color: customStyles.stepIndicatorLabelFinishedColor,
        };
        break;
      }

      case STEP_STATUS.UNFINISHED: {
        stepStyle = {
          backgroundColor: customStyles.stepIndicatorUnFinishedColor,
          borderWidth: customStyles.stepStrokeWidth,
          borderColor: customStyles.stepStrokeUnFinishedColor,
          height: customStyles.stepIndicatorSize,
          width: customStyles.stepIndicatorSize,
          borderRadius: customStyles.stepIndicatorSize / 2,
        };
        indicatorLabelStyle = {
          overflow: 'hidden',
          fontSize: customStyles.stepIndicatorLabelFontSize,
          color: customStyles.stepIndicatorLabelUnFinishedColor,
        };
        break;
      }
      default:
    }

    return (
      <Animated.View key="step-indicator" style={[styles.step, stepStyle]}>
        {renderStepIndicator ? (
          renderStepIndicator({
            position,
            stepStatus: this.getStepStatus(position),
          })
        ) : (
          showIndicatorLabel && <Text style={indicatorLabelStyle}>{position + 1}</Text>
        )}
      </Animated.View>
    );
  };

  render() {
    const { labels, direction } = this.props;
    const { width } = this.state;
    return (
      <View
        style={[
          styles.container,
          direction === 'vertical'
            ? { flexDirection: 'row', flex: 1 }
            : { flexDirection: 'column' },
        ]}
      >
        {width !== 0 && this.renderProgressBarBackground()}
        {width !== 0 && this.renderProgressBar()}
        {this.renderStepIndicator()}
        {labels && this.renderStepLabels()}
      </View>
    );
  }
}

StepIndicator.propTypes = {
  currentPosition: PropTypes.number,
  stepCount: PropTypes.number,
  customStyles: PropTypes.shape(),
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  labels: PropTypes.arrayOf(PropTypes.string),
  labelTextStyle: Text.propTypes.style,
  onPress: PropTypes.func,
  renderStepIndicator: PropTypes.func,
  showIndicatorLabel: PropTypes.bool,
};

StepIndicator.defaultProps = {
  currentPosition: 0,
  stepCount: 5,
  customStyles: {},
  labels: [],
  onPress: null,
  renderStepIndicator: null,
  labelTextStyle: null,
  direction: 'horizontal',
  showIndicatorLabel: true,
};
