import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import { ConvexClientProvider } from './context/ConvexClientProvider';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Shop from './pages/Shop';
import Dashboard from './pages/Dashboard';
import Merchant from './pages/Merchant';
import NFTLoans from './pages/NFTLoans';
import Aura from './pages/Aura';

function App() {
  return (
    <ConvexClientProvider>
      <ThemeProvider>
        <Web3Provider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/merchant" element={<Merchant />} />
                <Route path="/nft-loans" element={<NFTLoans />} />
                <Route path="/aura" element={<Aura />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Web3Provider>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}

export default App;
