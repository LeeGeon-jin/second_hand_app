import React, { useState, useRef, useEffect } from 'react';
import { SearchBar, Tabs, Divider, Toast, Popup, Button, Badge } from 'antd-mobile';
import ProductFormMobile from '../ProductForm/ProductFormMobile';
import api from '../../api';
import { LeftOutline, DownOutline, HeartOutline, HeartFill } from 'antd-mobile-icons';
// 示例分类，可后端动态获取
const defaultCategories = [
  '推荐', '家具', '电器', '电子', '文具', '服饰', '运动', '母婴', '美妆', '乐器', '图书', '宠物', '更多'
];

const MobileHome: React.FC = () => {
  // 跳转到登录页
  const goLogin = () => {
    window.location.href = '/login';
  };
  const [categories, setCategories] = useState<string[]>(defaultCategories);
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

  // 获取商品（示例）
  useEffect(() => {
    // TODO: 替换为真实API
    setProducts([]);
  }, []);

  return (
    <>
      <div className="mobile-home">
        {/* Header 搜索栏 */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '16px 0 8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f5f6f7', borderRadius: 24, padding: '0 8px', height: 40, width: '80%', maxWidth: 420 }}>
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
          <span
            onClick={() => Toast.show({ content: `搜索：${search}` })}
            style={{ fontWeight: 700, color: '#222', fontSize: 20, margin: '0 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >搜索</span>
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
          {filteredProducts.length === 0 && <div style={{textAlign:'center',color:'#bbb',marginTop:40}}>暂无商品</div>}
          {filteredProducts.map(item => {
            const img = item.image || (item.images && item.images[0]) || '';
            const title = item.title || '';
            const user = item.user || {};
            const avatar = user.avatar || '';
            const name = user.name || '';
            return (
              <div className="mh-card" key={item.id || item._id || Math.random()}>
                <div className="mh-card-img-wrap" onClick={() => Toast.show({ content: '进入详情' })}>
                  <img className="mh-card-img" src={img} alt={title} />
                </div>
                <div className="mh-card-title" onClick={() => Toast.show({ content: '进入详情' })}>{title}</div>
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
        <div className="mh-footer">
          <div className="mh-footer-item active">首页</div>
          <div
            className="mh-footer-item mh-footer-add"
            onClick={() => {
              if (!isLoggedIn) goLogin();
              else setShowPost(true);
            }}
          >+</div>
          <div
            className="mh-footer-item"
            onClick={() => {
              if (!isLoggedIn) goLogin();
              else Toast.show({ content: '消息' });
            }}
          >消息</div>
          <div
            className="mh-footer-item"
            onClick={() => {
              if (!isLoggedIn) goLogin();
              else Toast.show({ content: '我' });
            }}
          >我</div>
        </div>
        <Popup
          visible={showPost}
          onMaskClick={() => setShowPost(false)}
          position="bottom"
          bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, minHeight: '60vh' }}
        >
          <ProductFormMobile />
        </Popup>
      </div>
    </>
  );
};

export default MobileHome;
