# 🎡 Character Spinner

A custom wheel spinner website with unlimited customizable slices, probability-based outcomes, and beautiful animations.

## Features

✨ **Unlimited Slices** — Add or remove as many slices as you want

🎲 **Custom Probabilities** — Set different probability percentages for each slice

📐 **Proportional Sizing** — Slice size automatically matches its probability

🔥 **Flame Animation** — Beautiful 2-second flame animation when the wheel lands

🎯 **Result Display** — Shows the winning slice clearly

🎨 **Beautiful Design** — Modern gradient UI with smooth animations

## How to Use

1. **Open** `index.html` in your web browser
2. **Spin** the wheel by clicking the center button
3. **Add Slices** using the control panel on the right
4. **Customize** the name, probability, and color of each slice
5. **Delete** slices you no longer need

## Customization

### Adding a Slice
1. Enter a **name** (e.g., "Knight")
2. Enter a **probability** (1-100)
3. Choose a **color** using the color picker
4. Click **Create**

### Probability
- Each slice's probability determines how likely it is to be selected
- The visual size of each slice matches its probability
- Higher probability = larger slice

## Technical Details

- **HTML5 Canvas** for the wheel drawing
- **Pure JavaScript** with no dependencies
- **Responsive Design** works on desktop and mobile
- **CSS Animations** for smooth visual effects

## Project Structure

```
.
├── index.html      # Main HTML file
├── styles.css      # Styling and animations
├── script.js       # Main JavaScript logic
└── README.md       # This file
```

## How It Works

1. **Drawing**: The wheel is drawn using HTML5 Canvas with slices proportional to their probabilities
2. **Spinning**: Click the button to trigger a smooth rotation animation
3. **Selection**: The pointer at the top determines the winning slice
4. **Animation**: After landing, flames animate from the bottom of the screen
5. **Result**: The winning slice is displayed in the result panel

## Future Enhancements

- 🌳 Branching wheels (select a slice to open a new wheel)
- 💾 Save and load wheel configurations
- 📊 Statistics tracking
- 🎵 Sound effects
- 🌙 Dark mode

---

Made with ❤️ using HTML5, CSS3, and JavaScript
