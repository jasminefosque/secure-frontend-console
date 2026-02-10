import './Header.css';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">Secure by Design Reference Implementation</p>
      </div>
    </header>
  );
};
