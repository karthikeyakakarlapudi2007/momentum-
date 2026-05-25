import "../styles/button.css";

/**
 * Reusable Button component.
 *
 * @param {"primary" | "secondary" | "ghost"} variant - Visual style
 * @param {"sm" | "md" | "lg"} size - Button size
 * @param {React.ReactNode} children - Button label / content
 * @param {object} rest - Any additional HTML button attributes
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
