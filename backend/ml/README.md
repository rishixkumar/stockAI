# Machine Learning Trading System

This directory contains the machine learning-based trading prediction system that powers the AI-driven trading recommendations and Buy/Sell/Hold decisions.

## Components

### 1. `trading_predictor.py` - ML Trading Predictor
Generates personalized trading recommendations using technical indicators and sentiment analysis.

**Features:**
- **RSI (Relative Strength Index)**: Identifies overbought/oversold conditions
- **MACD (Moving Average Convergence Divergence)**: Detects trend changes and momentum
- **Bollinger Bands**: Analyzes volatility and price position
- **Moving Averages (SMA 20, 50, 200)**: Identifies trends and support/resistance
- **Support/Resistance Levels**: Calculates key price levels
- **Volume Analysis**: Detects unusual trading activity
- **Volatility Metrics**: Assesses risk levels

**Output:**
- 5-8 personalized trading recommendations
- Technical indicator values
- Confidence levels for each recommendation

### 2. `decision_engine.py` - Trading Decision Engine
Provides concrete Buy/Sell/Hold decisions with price targets and detailed explanations.

**Scoring System:**
- **Technical Score (35%)**: RSI, MACD, Moving Averages, Bollinger Bands
- **Sentiment Score (25%)**: News sentiment + Stock price sentiment
- **Momentum Score (20%)**: Price changes over 24h, 7d, 30d
- **Volatility Score (10%)**: Risk assessment
- **Volume Score (10%)**: Trading activity confirmation

**Decision Thresholds:**
- **BUY**: Overall score ≥ 0.15
- **SELL**: Overall score ≤ -0.15
- **HOLD**: -0.15 < Overall score < 0.15

**Output:**
- Buy/Sell/Hold decision
- Price target
- Confidence level (very_high, high, medium, low)
- Detailed explanation
- Risk level assessment
- Suggested time horizon

## Technical Indicators

### RSI (Relative Strength Index)
- **Range**: 0-100
- **Oversold**: < 30 (potential buy)
- **Neutral**: 40-60
- **Overbought**: > 70 (potential sell)

### MACD
- **Bullish**: MACD line crosses above signal line
- **Bearish**: MACD line crosses below signal line
- **Neutral**: Lines are close or parallel

### Bollinger Bands
- **Position**: Where price sits relative to bands
- **Oversold**: Price at or below lower band
- **Overbought**: Price at or above upper band
- **Bandwidth**: Volatility indicator

### Moving Averages
- **SMA 20**: Short-term trend (20 periods)
- **SMA 50**: Medium-term trend (50 periods)
- **SMA 200**: Long-term trend (200 periods)
- **Trend**: Strong uptrend when price > SMA20 > SMA50

## ML Algorithm Flow

```
1. Fetch Stock Data (300+ candlesticks)
   ↓
2. Calculate Technical Indicators
   - RSI, MACD, Bollinger Bands, MAs
   - Support/Resistance levels
   - Volume & Volatility metrics
   ↓
3. Analyze Sentiment Data
   - News sentiment (VADER)
   - Stock price sentiment
   - Combined sentiment
   ↓
4. Generate ML Scores
   - Technical: RSI + MACD + MA + Bollinger
   - Sentiment: News + Stock + Combined
   - Momentum: Price changes + Trend
   - Volatility: Risk assessment
   - Volume: Trading activity
   ↓
5. Calculate Weighted Score
   Overall = (Technical × 0.35) + (Sentiment × 0.25) 
           + (Momentum × 0.20) + (Volatility × 0.10) 
           + (Volume × 0.10)
   ↓
6. Make Decision
   - If score ≥ 0.15 → BUY
   - If score ≤ -0.15 → SELL
   - Otherwise → HOLD
   ↓
7. Generate Explanation
   - List key factors
   - Provide context
   - Suggest actions
```

## Recommendation Types

### Buy Opportunities
- **Pullback Buying**: Price near support with bullish indicators
- **Oversold Bounce**: RSI < 30 with positive sentiment
- **Breakout Setup**: Price near resistance with strong volume

### Risk Management
- **Stop-Loss Placement**: Based on support levels
- **Position Sizing**: Adjusted for volatility
- **Risk Warnings**: High volatility alerts

### Defensive Positions
- **Downtrend Confirmation**: Multiple bearish indicators
- **Overbought Warnings**: RSI > 70 with weak support
- **Sentiment Divergence**: Technical/sentiment conflicts

### Volume Confirmation
- **Volume Spike**: Confirms price movements
- **Low Volume**: Warns of weak trends
- **Volume Trend**: Overall activity assessment

## Usage Example

```python
from ml.trading_predictor import TradingPredictor
from ml.decision_engine import TradingDecisionEngine

# Initialize
predictor = TradingPredictor()
engine = TradingDecisionEngine()

# Generate signals
signals = predictor.generate_trading_signals(stock_data, sentiment_data)

# Make decision
decision = engine.make_trading_decision(
    signals, 
    sentiment_data, 
    stock_data, 
    current_price
)

print(f"Decision: {decision['decision']}")
print(f"Price Target: ${decision['price_target']}")
print(f"Explanation: {decision['explanation']}")
```

## Integration

The ML system is integrated into the `StockAnalyzer` class in `analysis/stock_analyzer.py`:

```python
self.trading_predictor = TradingPredictor()
self.decision_engine = TradingDecisionEngine()

# In comprehensive_analysis():
ml_signals = self.trading_predictor.generate_trading_signals(...)
trading_decision = self.decision_engine.make_trading_decision(...)
```

## Dependencies

- **numpy**: Numerical computations and array operations
- **yfinance**: Stock data retrieval
- **pandas**: Data manipulation (via yfinance)
- **vaderSentiment**: News sentiment analysis

## Notes

- All calculations are performed locally (no external ML APIs)
- The system uses rule-based ML with weighted scoring
- Technical indicators are calculated from raw price data
- Recommendations adapt to market conditions
- Confidence levels reflect signal agreement

## Future Enhancements

Potential improvements:
- Add more technical indicators (Stochastic, ATR, Fibonacci)
- Implement deep learning models for pattern recognition
- Add backtesting functionality
- Create ensemble models combining multiple strategies
- Add market regime detection
- Implement risk-adjusted position sizing

