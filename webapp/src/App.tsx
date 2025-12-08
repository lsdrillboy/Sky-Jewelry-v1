import { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import { initSession, pickStone, updateBirthdate, getProducts, getStones, submitCustomRequest } from './api';
import type {
  CustomRequestPayload,
  Product,
  Screen,
  Stone,
  StonePickerResult,
  User,
} from './types';
import Preloader from './components/Preloader';
import Cover from './components/Cover';
import MainMenu from './components/MainMenu';
import BirthdateForm from './components/BirthdateForm';
import StonePicker from './components/StonePicker';
import Catalog from './components/Catalog';
import CustomRequest from './components/CustomRequest';
import StoneLibrary from './components/StoneLibrary';

function extractInitData() {
  const tg = (window as any).Telegram?.WebApp;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('tgWebAppData') ?? params.get('initData');
  return tg?.initData ?? fromUrl ?? (import.meta.env.VITE_DEV_INIT_DATA as string) ?? '';
}

function App() {
  const [initData, setInitData] = useState('');
  const [screen, setScreen] = useState<Screen>('cover');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stoneResult, setStoneResult] = useState<StonePickerResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stones, setStones] = useState<Stone[]>([]);
  const [catalogFilters, setCatalogFilters] = useState<{ stone_id?: number; type?: string | null }>({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [stonesLoading, setStonesLoading] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
    const data = extractInitData();
    setInitData(data);
    (async () => {
      try {
        const { user } = await initSession(data);
        setUser(user);
      } catch (err) {
        console.error('initSession failed', err);
        setUser({ id: 'demo', first_name: 'Sky Guest', username: 'demo' });
        setToast('Dev режим: initData не передан, использую мок-пользователя.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (screen === 'catalog') {
      void refreshCatalog();
      if (!stones.length) void refreshStones();
    }
    if (screen === 'custom' || screen === 'library') {
      if (!stones.length) void refreshStones();
    }
  }, [screen, catalogFilters]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  const refreshStones = async (search?: string) => {
    setStonesLoading(true);
    try {
      const { stones } = await getStones(initData, search ? { search } : {});
      setStones(stones);
    } catch (err) {
      console.error('getStones failed', err);
      setToast('Не удалось загрузить список камней.');
    } finally {
      setStonesLoading(false);
    }
  };

  const refreshCatalog = async () => {
    setCatalogLoading(true);
    try {
      const { products } = await getProducts(initData, catalogFilters);
      setProducts(products);
    } catch (err) {
      console.error('getProducts failed', err);
      setToast('Не удалось загрузить каталог.');
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleBirthdateUpdate = async (birthdate: string) => {
    try {
      const { user } = await updateBirthdate(initData, birthdate);
      setUser(user);
      setScreen('stone');
    } catch (err) {
      console.error('updateBirthdate failed', err);
      setToast('Не удалось сохранить дату. Проверь подключение.');
    }
  };

  const handleStonePick = async (theme: string) => {
    setPickerLoading(true);
    try {
      const result = await pickStone(initData, theme);
      setStoneResult(result);
      if (result.life_path && user) {
        setUser({ ...user, life_path: result.life_path });
      }
    } catch (err) {
      console.error('pickStone failed', err);
      setToast('Не удалось подобрать камни. Попробуй ещё раз.');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleCustomRequest = async (payload: CustomRequestPayload) => {
    setRequestLoading(true);
    try {
      await submitCustomRequest(initData, payload);
      setToast('Заявка отправлена мастеру');
      setScreen('main');
    } catch (err) {
      console.error('custom request failed', err);
      setToast('Не удалось отправить заявку');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOpenCatalogWithStone = (stoneId: number) => {
    setCatalogFilters((prev) => ({ ...prev, stone_id: stoneId }));
    setScreen('catalog');
  };

  const content = useMemo(() => {
    if (loading) return <Preloader text="Проверяю подпись Telegram и прогреваю Supabase" />;
    if (screen === 'cover')
      return <Cover onStart={() => setScreen('main')} onCatalog={() => setScreen('catalog')} />;
    if (screen === 'main') return <MainMenu user={user} onNavigate={setScreen} onChangeBirthdate={() => setScreen('birthdate')} />;
    if (screen === 'birthdate')
      return <BirthdateForm user={user} onSubmit={handleBirthdateUpdate} onBack={() => setScreen('main')} />;
    if (screen === 'stone')
      return (
        <StonePicker
          result={stoneResult}
          loading={pickerLoading}
          lifePath={user?.life_path ?? null}
          onPick={handleStonePick}
          onOpenCatalog={handleOpenCatalogWithStone}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'catalog')
      return (
        <Catalog
          filters={catalogFilters}
          products={products}
          stones={stones}
          loading={catalogLoading}
          onChangeFilters={setCatalogFilters}
          onRefresh={refreshCatalog}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'custom')
      return (
        <CustomRequest
          stones={stones}
          onSubmit={handleCustomRequest}
          loading={requestLoading}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'library')
      return (
        <StoneLibrary
          stones={stones}
          loading={stonesLoading}
          onSearch={(q) => refreshStones(q)}
          onBack={() => setScreen('main')}
        />
      );
    return null;
  }, [
    loading,
    screen,
    user,
    stoneResult,
    pickerLoading,
    catalogFilters,
    products,
    stones,
    catalogLoading,
    stonesLoading,
    requestLoading,
  ]);

  return (
    <div className="app-shell">
      {content}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
