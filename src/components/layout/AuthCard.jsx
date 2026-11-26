// Title + description + form body used by every auth screen
const AuthCard = ({ title, description, children, footer }) => (
  <div className="flex flex-col gap-6">
    <div>
      <h1 className="text-3xl text-fg">{title}</h1>
      {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
    </div>
    {children}
    {footer && <div className="text-center text-sm text-fg-muted">{footer}</div>}
  </div>
);

export default AuthCard;
