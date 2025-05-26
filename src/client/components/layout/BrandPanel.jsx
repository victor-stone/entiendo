import logo from '../../assets/images/entiendoLogo-trans.png';

export default function BrandPanel({ children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 650 }}>
      {/* Background image with 50% opacity */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 650,
          height: 650,
          backgroundImage: `url(${logo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left', // fixed at top left
          backgroundSize: '650px 650px',
          opacity: 0.2,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Content above background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
