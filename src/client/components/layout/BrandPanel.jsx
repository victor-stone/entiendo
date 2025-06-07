import { useEffect } from 'react';
import logo from '../../assets/images/entiendoLogo-trans.png';
import sandbox from '../../assets/images/sandbox.jpg';
import lantern from '../../assets/images/lantern.png';
import candle from '../../assets/images/candle.png';
import blocks from '../../assets/images/blocks.png';
import { useBrandImageStore } from '../../stores';

const imgs = {
  logo,
  sandbox,
  lantern,
  candle,
  blocks
}
const styles = {
  blocks: {
    position: 'absolute',
    top: 50,
    left: '5%',
    width: 300, // matches aspect ratio
    height: 612, // matches aspect ratio
    backgroundImage: `url(${blocks})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    backgroundSize: 'contain', // proportional scaling
    opacity: 0.2,
    pointerEvents: 'none',
    zIndex: 0
  },
  candle: {
    position: 'absolute',
    top: 50,
    left: '5%',
    width: 300, // matches aspect ratio
    height: 612, // matches aspect ratio
    backgroundImage: `url(${candle})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    backgroundSize: 'contain', // proportional scaling
    opacity: 0.2,
    pointerEvents: 'none',
    zIndex: 0
  },
  lantern: {
    position: 'absolute',
    top: 50,
    left: '15%',
    width: 300, // matches aspect ratio
    height: 612, // matches aspect ratio
    backgroundImage: `url(${lantern})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    backgroundSize: 'contain', // proportional scaling
    opacity: 0.2,
    pointerEvents: 'none',
    zIndex: 0
  },
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
