import { useEffect } from 'react';
import logo from '../../assets/images/entiendoLogo-trans.png';
import sandbox from '../../assets/images/sandbox.jpg';
import { useBrandImageStore } from '../../stores';

const imgs = {
  logo,
  sandbox
}
const styles = {
  logo: {
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
        },
  sandbox: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100%',
          backgroundImage: `url(${sandbox})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left', // fixed at top left
          backgroundSize: 'cover',
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 1
  }
}
export default function BrandPanel({ children }) {
  const { image } = useBrandImageStore();
  
  const img = imgs[image];
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 650 }}>
      {/* Background image with 50% opacity */}
      <div style={styles[image]} />
      {/* Content above background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
