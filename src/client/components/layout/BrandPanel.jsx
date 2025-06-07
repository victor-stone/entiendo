import lantern from '../../assets/images/lantern.png';
import candle from '../../assets/images/candle.png';
import blocks from '../../assets/images/blocks.png';
import clock from '../../assets/images/clock.png';
import icecream from '../../assets/images/icecream.png';
import { useBrandImageStore } from '../../stores';

const imgs = {
  lantern,
  candle,
  blocks,
  clock,
  icecream
}
const _default = {
    position: 'absolute',
    top: 50,
    left: '5%',
    width: 300, // matches aspect ratio
    height: 612, // matches aspect ratio
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    backgroundSize: 'contain', // proportional scaling
    opacity: 0.2,
    pointerEvents: 'none',
    zIndex: 0
  };

const styles = {
  clock: { 
    ..._default,
    backgroundImage: `url(${clock})`
  },
  blocks: { 
    ..._default,
    backgroundImage: `url(${blocks})`
  },
  candle: {
    ..._default,
    backgroundImage: `url(${candle})`
  },
  lantern: {
    ..._default,
    backgroundImage: `url(${lantern})`
  },
  icecream: {
    ..._default,
    backgroundImage: `url(${icecream})`
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
