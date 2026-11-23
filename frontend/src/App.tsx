import Diagnostic from './Diagnostic';
import PortfolioEntry from './PortfolioEntry';

export default function App() {
  return typeof location !== 'undefined' && location.search === '?diagnostic' ? <Diagnostic /> : <PortfolioEntry />;
}
