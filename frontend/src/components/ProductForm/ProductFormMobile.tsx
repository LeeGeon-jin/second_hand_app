import React, { useState, useEffect } from 'react';
import { Form, Input, TextArea, Button, Toast, Selector, Space, Tag, Popup, List } from 'antd-mobile';
import ProductImageUploader from './ProductImageUploader';
import api from '../../api';

const ProductFormMobile: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  
  // 过滤掉blob URL的辅助函数
  const filterValidImages = (imageUrls: string[]) => {
    return imageUrls.filter(url => !url.startsWith('blob:'));
  };
  const [location, setLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  // 发帖会话ID与剩余估价次数（最多3次）
  const [formId] = useState<string>(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const [estimateRemaining, setEstimateRemaining] = useState<number | null>(3);
  const [form] = Form.useForm();

  // 地址输入功能
  const [suburbInput, setSuburbInput] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  // 澳洲州/领地选项
  const stateOptions = [
    { label: '新南威尔士州', value: 'NSW' },
    { label: '维多利亚州', value: 'VIC' },
    { label: '昆士兰州', value: 'QLD' },
    { label: '西澳大利亚州', value: 'WA' },
    { label: '南澳大利亚州', value: 'SA' },
    { label: '塔斯马尼亚州', value: 'TAS' },
    { label: '澳大利亚首都领地', value: 'ACT' },
    { label: '北领地', value: 'NT' },
    { label: '新西兰', value: 'New Zealand' },
  ];

  // 获取用户信息并设置默认地址
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = response.data as any;
          setUserInfo(userData);
          
          // 如果用户有地址信息，设置为默认值
          if (userData.location) {
            const { city, district } = userData.location;
            if (city) {
              setSuburbInput(city);
            }
            if (district) {
              // 尝试将district映射为州/领地
              const districtMapping: { [key: string]: string } = {
                // 澳洲州/领地 - 支持多种格式
                'NSW': 'NSW',
                'New South Wales': 'NSW',
                '新南威尔士州': 'NSW',
                'VIC': 'VIC',
                'Victoria': 'VIC',
                '维多利亚州': 'VIC',
                'QLD': 'QLD',
                'Queensland': 'QLD',
                '昆士兰州': 'QLD',
                'WA': 'WA',
                'Western Australia': 'WA',
                '西澳大利亚州': 'WA',
                'SA': 'SA',
                'South Australia': 'SA',
                '南澳大利亚州': 'SA',
                'TAS': 'TAS',
                'Tasmania': 'TAS',
                '塔斯马尼亚州': 'TAS',
                'ACT': 'ACT',
                'Australian Capital Territory': 'ACT',
                '澳大利亚首都领地': 'ACT',
                'NT': 'NT',
                'Northern Territory': 'NT',
                '北领地': 'NT',
                // 新西兰 - 支持多种格式
                'New Zealand': 'New Zealand',
                'NZ': 'New Zealand',
                '新西兰': 'New Zealand',
                'Auckland': 'New Zealand',
                'Wellington': 'New Zealand',
                'Canterbury': 'New Zealand',
                'Waikato': 'New Zealand',
                'Bay of Plenty': 'New Zealand',
                'Hawke\'s Bay': 'New Zealand',
                'Manawatu-Wanganui': 'New Zealand',
                'Taranaki': 'New Zealand',
                'Gisborne': 'New Zealand',
                'Marlborough': 'New Zealand',
                'Nelson': 'New Zealand',
                'West Coast': 'New Zealand',
                'Otago': 'New Zealand',
                'Southland': 'New Zealand'
              };
              
              const mappedState = districtMapping[district];
              if (mappedState) {
                setSelectedState(mappedState);
              }
            }
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // 使用在线地理编码服务获取suburb信息
  const getSuburbFromCoordinates = async (latitude: number, longitude: number): Promise<{
    suburb: string;
    state: string;
    fullAddress: string;
  } | null> => {
    try {
      // 使用Nominatim地理编码服务
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // 提取suburb信息
        let suburb = '';
        if (address.suburb) {
          suburb = address.suburb;
        } else if (address.city_district) {
          suburb = address.city_district;
        } else if (address.neighbourhood) {
          suburb = address.neighbourhood;
        } else if (address.city) {
          suburb = address.city;
        } else if (address.town) {
          suburb = address.town;
        }
        
        // 提取州/领地信息
        let state = '';
        if (address.state) {
          state = address.state;
        } else if (address.region) {
          state = address.region;
        }
        
        // 检查是否在澳洲新西兰
        const country = address.country?.toLowerCase() || '';
        if (country.includes('australia') || country.includes('new zealand')) {
          // 标准化州/领地名称
          const stateMapping: { [key: string]: string } = {
            'New South Wales': 'NSW',
            'Victoria': 'VIC',
            'Queensland': 'QLD',
            'Western Australia': 'WA',
            'South Australia': 'SA',
            'Tasmania': 'TAS',
            'Australian Capital Territory': 'ACT',
            'Northern Territory': 'NT',
            // 新西兰的所有地区都映射为 'New Zealand'
            'Auckland': 'New Zealand',
            'Wellington': 'New Zealand',
            'Canterbury': 'New Zealand',
            'Waikato': 'New Zealand',
            'Bay of Plenty': 'New Zealand',
            'Hawke\'s Bay': 'New Zealand',
            'Manawatu-Wanganui': 'New Zealand',
            'Taranaki': 'New Zealand',
            'Gisborne': 'New Zealand',
            'Marlborough': 'New Zealand',
            'Nelson': 'New Zealand',
            'West Coast': 'New Zealand',
            'Otago': 'New Zealand',
            'Southland': 'New Zealand'
          };
          
          const normalizedState = stateMapping[state] || state;
          
          return {
            suburb: suburb || 'Unknown Suburb',
            state: normalizedState,
            fullAddress: data.display_name || `${suburb}, ${state}`
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('地理编码错误:', error);
      return null;
    }
  };



  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // 使用在线地理编码服务获取suburb信息
            const locationInfo = await getSuburbFromCoordinates(latitude, longitude);
            
            if (locationInfo) {
              setSuburbInput(locationInfo.suburb);
              setSelectedState(locationInfo.state);
              setLocation(locationInfo.fullAddress);
              // 自动保存到用户信息
              saveUserLocation(locationInfo.suburb, locationInfo.state);
              Toast.show({ content: `已获取当前位置: ${locationInfo.suburb}, ${locationInfo.state}` });
            } else {
              Toast.show({ content: '无法获取当前位置的详细信息，请手动输入' });
            }
          } catch (error) {
            console.error('获取位置信息失败:', error);
            Toast.show({ content: '获取位置信息失败，请手动输入' });
          }
          
          setIsGettingLocation(false);
        },
        (error) => {
          setIsGettingLocation(false);
          Toast.show({ content: '获取位置失败，请手动选择' });
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsGettingLocation(false);
      Toast.show({ content: '浏览器不支持地理位置' });
    }
  };

  // 处理suburb输入变化
  const handleSuburbInputChange = (value: string) => {
    setSuburbInput(value);
    // 自动保存到用户信息
    saveUserLocation(value, selectedState);
  };

  // 处理州/领地选择变化
  const handleStateChange = (value: string[]) => {
    const newState = value[0] || '';
    setSelectedState(newState);
    // 自动保存到用户信息
    saveUserLocation(suburbInput, newState);
  };

  // 州/领地选择器状态
  const [statePickerVisible, setStatePickerVisible] = useState(false);

  // 保存用户地址信息
  const saveUserLocation = async (suburb: string, state: string) => {
    if (suburb && state) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.put('/users/me', {
            location: {
              city: suburb,
              district: state
            }
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (error) {
        console.error('保存用户地址失败:', error);
      }
    }
  };

  // AI估价功能
  const handlePriceEstimation = async () => {
    try {
      const values = await form.validateFields(['title', 'category', 'description']).catch(() => null);
      if (!values) {
        Toast.show({ content: '请先填写商品标题、类别和描述' });
        return;
      }

      // 检查图片
      if (images.length === 0) {
        Toast.show({ content: '请先上传至少一张商品图片' });
        return;
      }

      // 检查描述长度
      if (!values.description || values.description.length < 20) {
        Toast.show({ content: '描述不能少于20个字，请详细描述商品后重试' });
        return;
      }

      setIsEstimatingPrice(true);

      const response = await api.post('/products/estimate-price', {
        title: values.title,
        category: Array.isArray(values.category) ? values.category[0] : values.category,
        description: values.description || '',
        images: images,
        formId
      });

      const data = response.data as any;
      if (data.success) {
        const { estimatedPrice, priceRange, suggestions, reasoning } = data;
        if (typeof data.remaining === 'number') {
          setEstimateRemaining(data.remaining);
        }
        
        let message = `AI估价建议：\n`;
        if (estimatedPrice) {
          message += `建议价格：$${estimatedPrice}\n`;
        }
        if (priceRange) {
          message += `价格范围：$${priceRange.min} - $${priceRange.max}\n`;
        }
        if (reasoning) {
          message += `估价理由：${reasoning}\n`;
        }
        if (suggestions && suggestions.length > 0) {
          message += `\n建议：\n${suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
        }
        if (typeof data.limit === 'number' && typeof data.remaining === 'number') {
          message += `\n\n剩余次数：${data.remaining}/${data.limit}`;
        } else if (data.hint) {
          message += `\n\n${data.hint}`;
        }

        // 显示估价结果
        Toast.show({ 
          content: message,
          duration: 5000,
          position: 'center'
        });

        // 如果估价成功，自动填入价格框
        if (estimatedPrice) {
          form.setFieldValue('price', estimatedPrice);
        }
      } else {
        if (typeof data.remaining === 'number') {
          setEstimateRemaining(data.remaining);
        }
        Toast.show({ content: data.message || '估价失败' });
      }
    } catch (error: any) {
      console.error('AI估价错误:', error);
      const msg = error?.response?.data?.message || '估价服务暂时不可用，请稍后重试';
      const remaining = error?.response?.data?.remaining;
      const limit = error?.response?.data?.limit;
      if (typeof remaining === 'number') setEstimateRemaining(remaining);
      Toast.show({ content: typeof remaining === 'number' && typeof limit === 'number' ? `${msg}（剩余次数：${remaining}/${limit}）` : msg });
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  const handleSubmit = async (values: any) => {
    // 暂时移除图片上传要求，方便测试
    if (images.length === 0) {
      Toast.show({ content: '请先上传至少一张图片' });
      return;
    }

    try {
      const res = await api.post('/products', {
        ...values,
        category: Array.isArray(values.category) ? values.category[0] : values.category,
        images,
        description: values.description,
        location: location || (suburbInput && selectedState ? `${suburbInput}, ${selectedState}` : ''),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data as { auditFailed?: boolean; message?: string };
      if (data.auditFailed) {
        const draft = {
          ...values,
          category: Array.isArray(values.category) ? values.category[0] : values.category,
          images,
          description: values.description,
          location: location || (suburbInput && selectedState ? `${suburbInput}, ${selectedState}` : ''),
          savedAt: Date.now(),
        };
        localStorage.setItem('product-draft', JSON.stringify(draft));
        Toast.show({ content: (data.message || '内容未通过AI审核') + '，商品仅本人和管理员可见，已保存为本地草稿' });
      } else {
        Toast.show({ content: '发布成功，已通过AI审核' });
      }
      form.resetFields();
      setImages([]);
      setLocation('');
      setSuburbInput('');
      setSelectedState('');
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('product-posted'));
      }
    } catch (e: any) {
      if (e?.response?.data?.message && e.response.data.message.includes('审核')) {
        const draft = {
          ...values,
          category: Array.isArray(values.category) ? values.category[0] : values.category,
          images,
          description: values.description,
          location: location || (suburbInput && selectedState ? `${suburbInput}, ${selectedState}` : ''),
          savedAt: Date.now(),
        };
        localStorage.setItem('product-draft', JSON.stringify(draft));
        Toast.show({ content: '内容未通过AI审核，已保存为本地草稿，仅自己可见' });
      } else {
        Toast.show({ content: e?.response?.data?.message || '发布失败' });
      }
    }
  };

  // 分类选项可后端动态获取
  const categoryOptions = [
    { label: '家具', value: '家具' },
    { label: '电器', value: '电器' },
    { label: '电子产品', value: '电子产品' },
    { label: '文具', value: '文具' },
    { label: '服饰', value: '服饰' },
    { label: '运动', value: '运动' },
    { label: '母婴', value: '母婴' },
    { label: '美妆', value: '美妆' },
    { label: '乐器', value: '乐器' },
    { label: '图书', value: '图书' },
    { label: '宠物', value: '宠物' },
    { label: '其他', value: '其他' },
  ];

  return (
    <div style={{ padding: 16 }}>
      <ProductImageUploader 
        value={images} 
        onChange={(newImages) => {
          const validImages = filterValidImages(newImages);
          console.log('ProductForm - 设置图片:', validImages);
          setImages(validImages);
        }} 
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              style={{ flex: 1, background: '#f5f5f5', color: '#666', border: 'none' }}
              onClick={async () => {
                const values = await form.validateFields().catch(() => undefined);
                if (!values) return;
                // 暂时移除图片上传要求，方便测试
                // if (images.length === 0) {
                //   Toast.show({ content: '请先上传至少一张图片' });
                //   return;
                // }
                const draft = {
                  ...values,
                  category: Array.isArray(values.category) ? values.category[0] : values.category,
                  images,
                  description: values.description,
                  location: location || (suburbInput && selectedState ? `${suburbInput}, ${selectedState}` : ''),
                  savedAt: Date.now(),
                };
                localStorage.setItem('product-draft', JSON.stringify(draft));
                Toast.show({ content: '已保存为本地草稿，仅自己和管理员可见' });
              }}
            >保存草稿</Button>
            <Button block type="submit" color="primary" style={{ flex: 2 }}>发布商品</Button>
          </div>
        }
      >
        <Form.Item name="title" label="商品标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="如：九成新小米手机" />
        </Form.Item>
        <Form.Item name="category" label="商品类别" rules={[{ required: true, message: '请选择类别' }]}>
          <Selector options={categoryOptions} columns={6} />
        </Form.Item>
        <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input type="number" placeholder="请输入价格" style={{ flex: 1 }} />
            <Button
              size="small"
              onClick={handlePriceEstimation}
              loading={isEstimatingPrice}
              style={{ 
                background: '#1890ff', 
                color: 'white', 
                border: 'none',
                whiteSpace: 'nowrap'
              }}
              disabled={estimateRemaining === 0}
            >
              🤖 AI估价
            </Button>
            <span style={{ fontSize: 12, color: '#888' }}>
              {estimateRemaining !== null ? `剩余${estimateRemaining ?? 0}次` : '最多3次'}
            </span>
          </div>
        </Form.Item>
        <Form.Item name="description" label="商品描述">
          <TextArea rows={3} placeholder="可填写成色、交易地点等" />
        </Form.Item>
        
        {/* 所在城区 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>
            所在城区（可选）
            <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
              💡 地址信息会自动保存到个人资料
            </span>
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 获取当前位置 */}
            <Button 
              size="small" 
              onClick={handleGetCurrentLocation}
              loading={isGettingLocation}
              style={{ marginBottom: 8 }}
            >
              📍 获取当前位置
            </Button>
            
            {/* 显示获取的位置 */}
            {location && (
              <Tag color="blue" style={{ marginBottom: 8 }}>
                {location}
              </Tag>
            )}
            
            {/* Suburb输入框和州/领地选择器 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="输入Suburb（如：Bondi, Strathfield, Melbourne CBD等）"
                  value={suburbInput}
                  onChange={(val) => handleSuburbInputChange(val)}
                />
              </div>
              <div style={{ width: 120 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                  州/领地：
                </div>
                <Button
                  size="small"
                  style={{
                    width: '100%',
                    height: '32px',
                    fontSize: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: '#fff',
                    color: selectedState ? '#333' : '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px'
                  }}
                  onClick={() => setStatePickerVisible(true)}
                >
                  {selectedState || '请选择'}
                  <span style={{ fontSize: '10px' }}>▼</span>
                </Button>
              </div>
            </div>
            
            {/* 州/领地选择器弹窗 */}
            <Popup
              visible={statePickerVisible}
              onMaskClick={() => setStatePickerVisible(false)}
              position="bottom"
              bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '50vh' }}
            >
              <div style={{ padding: '16px 0' }}>
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  paddingBottom: '8px'
                }}>
                  选择州/领地
                </div>
                <List>
                  {stateOptions.map((option) => (
                    <List.Item
                      key={option.value}
                      onClick={() => {
                        setSelectedState(option.value);
                        saveUserLocation(suburbInput, option.value);
                        setStatePickerVisible(false);
                      }}
                      style={{
                        backgroundColor: selectedState === option.value ? '#f0f8ff' : 'transparent',
                        color: selectedState === option.value ? '#1677ff' : '#333'
                      }}
                    >
                      {option.label}
                    </List.Item>
                  ))}
                </List>
              </div>
            </Popup>
            
            {/* 显示当前选择的地址 */}
            {suburbInput && selectedState && (
              <Tag color="blue" style={{ marginTop: 8 }}>
                已选择: {suburbInput}, {selectedState}
              </Tag>
            )}
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ProductFormMobile;
