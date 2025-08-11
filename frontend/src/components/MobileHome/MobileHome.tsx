import React, { useState, useRef, useEffect } from 'react';
import { Divider, Toast, Popup } from 'antd-mobile';

// import api from '../../api';
import { DownOutline, HeartOutline, HeartFill } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import MobileFooter from './MobileFooter';
import './MobileFooter.css';
import './MobileHome.css';

// 示例分类，可后端动态获取
const defaultCategories = [
  '推荐', '家具', '电器', '电子产品', '文具', '服饰', '运动', '母婴', '美妆', '乐器', '图书', '宠物', '更多'
];

const MobileHome: React.FC = () => {
  // 跳转到登录页
  const navigate = useNavigate();
  const goLogin = () => {
    navigate('/login');
  };
  const [categories] = useState<string[]>(defaultCategories);
  const [activeCat, setActiveCat] = useState<string>('推荐');
  const [showAllCats, setShowAllCats] = useState(false);
  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [showPost, setShowPost] = useState(false);
  const catBarRef = useRef<HTMLDivElement>(null);

  // 判断是否登录
  const isLoggedIn = !!localStorage.getItem('token');

  // 过滤商品
  let filteredProducts = products.filter(item => {
    const matchCat = activeCat === '推荐' || item.category === activeCat;
    const matchSearch = !search || item.title?.includes(search) || item.description?.includes(search);
    return matchCat && matchSearch;
  });

  // 如果当前分类没有商品，保持空列表（显示"暂无商品"）
  // 只有在"推荐"分类下才显示所有商品

  // 推荐页排序逻辑
  if (activeCat === '推荐') {
    if (!isLoggedIn) {
      // 未登录：按发帖时间倒序
      filteredProducts = filteredProducts.slice().sort((a, b) => {
        const t1 = new Date(b.createdAt || 0).getTime();
        const t2 = new Date(a.createdAt || 0).getTime();
        return t1 - t2;
      });
    } else {
      // 登录：优先展示用户偏好类别，按发帖时间倒序
      let preferences: string[] = [];
      try {
        preferences = JSON.parse(localStorage.getItem('categoryPreference') || '[]');
      } catch {}
      if (preferences.length > 0) {
        const preferred = filteredProducts.filter(p => preferences.includes(p.category));
        const others = filteredProducts.filter(p => !preferences.includes(p.category));
        preferred.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        others.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        filteredProducts = [...preferred, ...others];
      } else {
        filteredProducts = filteredProducts.slice().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
    }
  }

  // 点赞处理（示例）
  const handleLike = (id: string) => {
    setProducts(prev => prev.map(item =>
      (item.id === id || item._id === id)
        ? { ...item, liked: !item.liked, likeCount: (item.likeCount || 0) + (item.liked ? -1 : 1) }
        : item
    ));
  };

  // 获取商品
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://secondhand-production.up.railway.app/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('获取商品失败:', error);
        setProducts([]);
      }
    };
    
    fetchProducts();
  }, []);

  React.useEffect(() => {
    const handler = () => setShowPost(true);
    window.addEventListener('showPostPopup', handler);
    return () => window.removeEventListener('showPostPopup', handler);
  }, []);

  // 监听商品发布事件，刷新商品列表
  React.useEffect(() => {
    const handler = () => {
      // 重新获取商品列表
      const fetchProducts = async () => {
        try {
          const response = await fetch('https://secondhand-production.up.railway.app/api/products');
          const data = await response.json();
          setProducts(data);
        } catch (error) {
          console.error('获取商品失败:', error);
        }
      };
      fetchProducts();
    };
    
    window.addEventListener('product-posted', handler);
    return () => window.removeEventListener('product-posted', handler);
  }, []);

  // 格式化价格
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      <div className="mobile-home">
        {/* Header 搜索栏 */}
        <div className="mh-header">
          <div className={`mh-search-bar${focus ? ' focused' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginLeft: 8, marginRight: 4 }}><circle cx="9" cy="9" r="7" stroke="#bbb" strokeWidth="2" fill="none"/><line x1="15" y1="15" x2="19" y2="19" stroke="#bbb" strokeWidth="2"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索你想要的商品"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 16,
                height: 36,
                padding: '0 4px',
              }}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              onKeyDown={e => { if (e.key === 'Enter') Toast.show({ content: `搜索：${search}` }); }}
            />
          </div>
          <button
            className="mh-search-btn"
            onClick={() => Toast.show({ content: `搜索：${search}` })}
          >
            搜索
          </button>
        </div>
        <Divider style={{ margin: '8px 0 0 0', borderColor: '#eee' }} />
        {/* 分类Tab横滑 */}
        <div className="mh-cat-bar" ref={catBarRef}>
          {categories.map(cat => (
            <div
              key={cat}
              className={`mh-cat-item${cat === activeCat ? ' active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </div>
          ))}
          <div className="mh-cat-arrow" onClick={() => setShowAllCats(true)}>
            <DownOutline />
          </div>
        </div>
        {/* 分类下拉菜单 */}
        <Popup
          visible={showAllCats}
          onMaskClick={() => setShowAllCats(false)}
          position="bottom"
          bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          <div className="mh-cat-popup">
            {categories.map(cat => (
              <div
                key={cat}
                className={`mh-cat-popup-item${cat === activeCat ? ' active' : ''}`}
                onClick={() => { setActiveCat(cat); setShowAllCats(false); }}
              >
                {cat}
              </div>
            ))}
          </div>
        </Popup>
        {/* 商品列表 */}
        <div className="mh-list">
          {filteredProducts.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: '#bbb',
              marginTop: 40,
              fontSize: 16
            }}>
              {activeCat === '推荐' ? '暂无商品' : `${activeCat}分类暂无商品`}
            </div>
          )}
          {filteredProducts.map(item => {
            let img = item.image || (item.images && item.images[0]) || '';
            // 如果是相对路径，添加后端URL
            if (img && img.startsWith('/api/')) {
              img = 'https://secondhand-production.up.railway.app' + img;
            }
            const title = item.title || '';
            const user = item.user || {};
            const avatar = user.avatar || '';
            const name = user.name || '';
            const price = item.price || 0;
            return (
              <div className="mh-card" key={item.id || item._id || Math.random()}>
                <div className="mh-card-img-wrap" onClick={() => Toast.show({ content: '进入详情' })}>
                  <img className="mh-card-img" src={img} alt={title} />
                </div>
                <div className="mh-card-title" onClick={() => Toast.show({ content: '进入详情' })}>{title}</div>
                <div className="mh-card-price">{formatPrice(price)}</div>
                <div className="mh-card-bottom">
                  <div className="mh-card-user" onClick={() => Toast.show({ content: '用户信息' })}>
                    <img className="mh-card-avatar" src={avatar} alt={name} />
                    <span className="mh-card-nick">{name}</span>
                  </div>
                  <div className="mh-card-like" onClick={() => handleLike(item.id || item._id)}>
                    {item.liked ? <HeartFill color="#ff3141" /> : <HeartOutline />}
                    <span className="mh-card-like-count">{item.likeCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer 导航栏 */}
        <MobileFooter />
        {/* 发帖弹窗已由 App.tsx 全局管理 */}
      </div>
    </>
  );
};

export default MobileHome;
