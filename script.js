
        // Configuration - Your GitHub details
        const GITHUB_USERNAME = 'shofiqul8008';
        const GITHUB_REPO = 'MyGallery';
        const IMAGES_FOLDER = 'friend;
        const IMAGES_PER_PAGE = 20; // Increased for better Pinterest-style loading
        
        // State variables
        let currentPage = 1;
        let allImages = [];
        let isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // DOM Elements
        const gallery = document.getElementById('gallery');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const menuBtn = document.getElementById('menuBtn');
        const sideMenu = document.getElementById('sideMenu');
        const closeMenu = document.getElementById('closeMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        const darkModeBtn = document.getElementById('darkModeBtn');
        const lightModeBtn = document.getElementById('lightModeBtn');
        const contactLink = document.getElementById('contactLink');
        const homepageLink = document.getElementById('homepageLink');
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Apply dark mode if previously set
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Function to fetch actual images from GitHub repository
        async function fetchImagesFromGitHub() {
            try {
                // GitHub API URL to get contents of the picture folder
                const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${IMAGES_FOLDER}`;
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
                
                const files = await response.json();
                
                // Filter for image files
                const imageFiles = files.filter(file => {
                    const extension = file.name.toLowerCase().split('.').pop();
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
                });
                
                if (imageFiles.length === 0) {
                    // If no images found in GitHub, fall back to sample images
                    console.log('No images found in GitHub repository, using sample images');
                    return generateSampleImages();
                }
                
                // Convert GitHub file objects to our image format
                const images = imageFiles.map((file, index) => {
                    // Use raw.githubusercontent.com for direct image access
                    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${IMAGES_FOLDER}/${file.name}`;
                    
                    return {
                        id: index + 1,
                        url: rawUrl,
                        downloadUrl: rawUrl, // GitHub raw URL can be downloaded directly
                        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                        date: formatDate(new Date(file.created_at || file.updated_at || Date.now())),
                        category: 'GitHub Image'
                    };
                });
                
                return images;
                
            } catch (error) {
                console.error('Error fetching from GitHub:', error);
                console.log('Falling back to sample images');
                // Fall back to sample images if GitHub fetch fails
                return generateSampleImages();
            }
        }
        
        // Generate sample images with varying aspect ratios (Pinterest style)
        function generateSampleImages() {
            const sampleImages = [];
            const categories = ['Nature', 'City', 'Technology', 'Food', 'Travel', 'Art', 'Animals', 'Sports'];
            
            for (let i = 1; i <= 40; i++) {
                const category = categories[Math.floor(Math.random() * categories.length)];
                
                // Varying aspect ratios for Pinterest-style layout
                const aspectRatios = [0.66, 0.75, 0.8, 1, 1.2, 1.33, 1.5];
                const aspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
                const width = 300 + Math.floor(Math.random() * 200);
                const height = Math.round(width / aspectRatio);
                
                sampleImages.push({
                    id: i,
                    url: `https://picsum.photos/seed/gallery${i}/${width}/${height}`,
                    downloadUrl: `https://picsum.photos/seed/gallery${i}/${width}/${height}?download=1`,
                    name: `${category} ${i}`,
                    date: formatDate(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)),
                    category: category
                });
            }
            
            return sampleImages;
        }
        
        // Format date
        function formatDate(date) {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        
        // Initialize the gallery
        async function initGallery() {
            try {
                loadingIndicator.style.display = 'block';
                loadMoreBtn.style.display = 'none';
                
                // Fetch images from GitHub
                allImages = await fetchImagesFromGitHub();
                
                loadingIndicator.style.display = 'none';
                
                if (allImages.length > 0) {
                    renderGallery();
                    setupLazyLoading();
                    loadMoreBtn.style.display = allImages.length > IMAGES_PER_PAGE ? 'inline-block' : 'none';
                } else {
                    gallery.innerHTML = '<div style="text-align: center; padding: 40px; color: #666; font-size: 1.2rem;">No images found in the specified GitHub folder.</div>';
                }
            } catch (error) {
                console.error('Error loading images:', error);
                loadingIndicator.innerHTML = '<div style="color: #e60023; padding: 20px;">Error loading images. Using sample images instead.</div>';
                
                // Try to load sample images as fallback
                allImages = generateSampleImages();
                loadingIndicator.style.display = 'none';
                renderGallery();
                setupLazyLoading();
                loadMoreBtn.style.display = allImages.length > IMAGES_PER_PAGE ? 'inline-block' : 'none';
            }
        }
        
        // Render images to the gallery
        function renderGallery() {
            // Clear gallery if it's the first page
            if (currentPage === 1) {
                gallery.innerHTML = '';
            }
            
            // Calculate which images to show
            const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
            const endIndex = startIndex + IMAGES_PER_PAGE;
            const imagesToShow = allImages.slice(startIndex, endIndex);
            
            // Create image cards
            imagesToShow.forEach(image => {
                const imageCard = document.createElement('div');
                imageCard.className = 'image-card fade-in';
                imageCard.innerHTML = `
                    <div class="image-container">
                        <img 
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E"
                            data-src="${image.url}"
                            alt="${image.name}"
                            loading="lazy"
                            class="gallery-image"
                        >
                        <div class="image-overlay">
                            <button class="download-btn" onclick="downloadImage('${image.downloadUrl}', '${image.name.replace(/\s+/g, '_')}')">
                                <i class="fas fa-download"></i>
                            </button>
                            <div class="image-info">
                                <div class="image-name"></div>
                                <div class="image-date">${image.date}</div>
                            </div>
                        </div>
                    </div>
                `;
                
                gallery.appendChild(imageCard);
            });
            
            // Hide load more button if all images are displayed
            if (endIndex >= allImages.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
        
        // Setup lazy loading for images
        function setupLazyLoading() {
            const lazyImages = document.querySelectorAll('.gallery-image');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '200px 0px', // Increased for smoother Pinterest-style loading
                threshold: 0.01
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
        
        // Download image function
        function downloadImage(url, filename) {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'image';
            link.target = '_blank';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show a temporary notification
            showNotification('Download started!');
        }
        
        // Show notification
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #333;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                animation: fadeIn 0.3s;
            `;
            
            if (isDarkMode) {
                notification.style.backgroundColor = '#444';
                notification.style.color = '#f0f0f0';
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 2000);
        }
        
        // Menu functionality
        function openMenu() {
            sideMenu.classList.add('active');
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeMenuHandler() {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Theme functionality
        function enableDarkMode() {
            document.body.classList.add('dark-mode');
            isDarkMode = true;
            localStorage.setItem('darkMode', 'true');
        }
        
        function enableLightMode() {
            document.body.classList.remove('dark-mode');
            isDarkMode = false;
            localStorage.setItem('darkMode', 'false');
        }
        
        // Event Listeners
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderGallery();
            setupLazyLoading();
        });
        
        menuBtn.addEventListener('click', openMenu);
        closeMenu.addEventListener('click', closeMenuHandler);
        menuOverlay.addEventListener('click', closeMenuHandler);
        
        darkModeBtn.addEventListener('click', () => {
            enableDarkMode();
            closeMenuHandler();
        });
        
        lightModeBtn.addEventListener('click', () => {
            enableLightMode();
            closeMenuHandler();
        });
        
        contactLink.href = `https://shofiqul8008.github.io/profile/`;
        homepageLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Refresh the page to go to homepage
            window.location.href = window.location.origin + window.location.pathname;
        });
        
        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenuHandler();
            }
        });
        
        // Initialize the gallery when page loads
        document.addEventListener('DOMContentLoaded', initGallery);
    