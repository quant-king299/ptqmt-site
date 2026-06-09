<!-- _coverpage.md -->

<div class="cyber-cover-container">
  <div class="cover-main-content">
    <h1><span class="gradient-text">PTrade</span>/<span class="gradient-text">QMT</span>技术文档</h1>
    
    <p class="cover-subtitle">这是一份量化技术学习资料</p>
    
    
    <div class="cover-footer">
      <p class="copyright-text">Copyright © 2024 王者quant All Rights Reserved.</p>
      <div class="cover-links">
        <a href="https://space.bilibili.com/3546954682337740" target="_blank" class="cover-link">王者quant</a>
        <a href="#/学习案例/EasyXT" class="cover-link">EasyXT</a>
        <a href="#/README" class="cover-link primary">开始阅读文档</a>
      </div>
    </div>
  </div>
  
  <!-- 科技背景装饰 -->
  <div class="cyber-bg-decoration">
    <div class="cyber-grid"></div>
    <div class="cyber-particles"></div>
  </div>
</div>

<style>
/* 覆盖页面温暖米白风背景 */
.cyber-cover-container {
  min-height: 100vh;
  background: #faf9f7;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(74, 144, 226, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(243, 156, 18, 0.02) 0%, transparent 50%),
    linear-gradient(rgba(74, 144, 226, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 144, 226, 0.05) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 科技网格背景 - 温和版本 */
.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(74, 144, 226, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 144, 226, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 移除粒子效果，保持简洁 */
.cyber-particles {
  display: none;
}

/* 主内容区域 - 白色卡片背景 */
.cover-main-content {
  text-align: center;
  padding: 60px 40px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e8e6e3;
  box-shadow: 0 20px 40px rgba(44, 62, 80, 0.1);
}

/* 主标题样式 - 深色文字 */
.cover-main-content h1 {
  font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  position: relative;
  color: #2c3e50;
}

/* 副标题样式 - 温和蓝色 */
.cover-subtitle {
  font-family: 'Rajdhani', 'Microsoft YaHei', sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: #5d6d7e;
  margin-bottom: 3rem;
  letter-spacing: 0.03em;
}

/* 按钮容器 */
.tech-nav-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 40px 0;
}

/* 科技按钮样式 - 温暖米白风 */
.tech-nav-button {
  font-family: 'Rajdhani', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-block;
  padding: 18px 35px;
  margin: 15px 20px;
  color: white !important;
  text-decoration: none;
  border-radius: 25px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(44, 62, 80, 0.2);
  min-width: 180px;
}

.tech-nav-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(44, 62, 80, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.tech-nav-button .tech-icon {
  font-size: 1.3rem;
  margin-right: 10px;
  display: inline-block;
}

/* 不同按钮的渐变背景 - 温暖米白风 */
.ai-code-button {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  background-size: 200% 200%;
  animation: gradient-flow 4s ease-in-out infinite;
}

.ai-code-button:hover {
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

.docs-button {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  background-size: 200% 200%;
  animation: gradient-flow 5s ease-in-out infinite;
}

.docs-button:hover {
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
}

.tech-share-button {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  background-size: 200% 200%;
  animation: gradient-flow 6s ease-in-out infinite;
}

.tech-share-button:hover {
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
}

.resource-button {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  background-size: 200% 200%;
  animation: gradient-flow 7s ease-in-out infinite;
}

.resource-button:hover {
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
}

.download-button {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  background-size: 200% 200%;
  animation: gradient-flow 8s ease-in-out infinite;
}

.download-button:hover {
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
}

/* 页脚样式 - 温暖米白风 */
.cover-footer {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #e8e6e3;
}

.copyright-text {
  font-size: 0.9rem;
  color: #85929e;
  margin-bottom: 20px;
  font-family: 'Space Grotesk', 'Microsoft YaHei', sans-serif;
}

.cover-links {
  display: flex;
  justify-content: center;
  gap: 25px;
}

.cover-link {
  font-family: 'Rajdhani', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 25px;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cover-link:not(.primary) {
  color: #4a90e2;
  border: 2px solid #4a90e2;
  background: rgba(74, 144, 226, 0.1);
}

.cover-link:not(.primary):hover {
  background: #4a90e2;
  color: white;
  box-shadow: 0 5px 15px rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
}

.cover-link.primary {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: 2px solid rgba(74, 144, 226, 0.3);
}

.cover-link.primary:hover {
  background: linear-gradient(135deg, #357abd 0%, #4a90e2 100%);
  box-shadow: 0 5px 15px rgba(74, 144, 226, 0.4);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cover-main-content {
    padding: 40px 20px;
    margin: 20px;
  }
  
  .cover-main-content h1 {
    font-size: 2.5rem;
  }
  
  .cover-subtitle {
    font-size: 1.2rem;
  }
  
  .tech-nav-container {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .tech-nav-button {
    width: 280px;
    font-size: 1rem;
    padding: 15px 30px;
    min-width: auto;
  }
  
  .cover-links {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .cover-main-content h1 {
    font-size: 2rem;
  }
  
  .tech-nav-button {
    width: 250px;
    font-size: 0.9rem;
    padding: 12px 25px;
  }
}

/* 渐变流动动画 */
@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 确保覆盖docsify默认样式 */
.cover.show {
  background: none !important;
}

.cover .cover-main {
  background: none !important;
}

/* 强制覆盖任何可能的白色背景 */
body.close .sidebar,
body.close .sidebar-toggle,
body.close .content {
  background: none !important;
}
</style>