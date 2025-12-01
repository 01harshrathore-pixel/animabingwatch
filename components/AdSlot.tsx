 // components/AdSlot.tsx - UNIVERSAL VERSION FOR ALL AD NETWORKS
import React, { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  position: string;
  className?: string;
  adCode?: string;
  isActive?: boolean;
  onAdLoaded?: () => void;
  onAdError?: (error: string) => void;
}

const AdSlot: React.FC<AdSlotProps> = ({ 
  position, 
  className = '', 
  adCode, 
  isActive = true,
  onAdLoaded,
  onAdError
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adId] = useState(`ad-${position}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    const scriptElements: HTMLScriptElement[] = [];

    const loadAd = () => {
      if (!isMounted || !adRef.current) return;

      // Clear previous content
      adRef.current.innerHTML = '';
      setError(null);
      
      // Clear previously loaded scripts
      scriptElements.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      scriptElements.length = 0;

      // If no ad code or inactive, show placeholder
      if (!adCode || !isActive) {
        adRef.current.innerHTML = `
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div class="text-slate-400 text-sm mb-1">📢 Advertisement</div>
            <div class="text-slate-500 text-xs">
              ${position} Slot - ${!adCode ? 'No Ad Configured' : 'Inactive'}
            </div>
          </div>
        `;
        setLoading(false);
        if (onAdLoaded) onAdLoaded();
        return;
      }

      setLoading(true);

      try {
        // Create a unique container for this ad
        const container = document.createElement('div');
        container.id = adId;
        container.className = 'ad-container';
        
        // Insert the raw ad code
        container.innerHTML = adCode;
        
        // Append container to our ref element
        adRef.current.appendChild(container);
        
        // Extract and execute all script tags
        const scripts = container.getElementsByTagName('script');
        const scriptArray = Array.from(scripts);
        
        // Store original script positions
        const scriptPromises: Promise<void>[] = [];
        
        scriptArray.forEach((oldScript, index) => {
          const newScript = document.createElement('script');
          
          // Copy all attributes
          if (oldScript.attributes) {
            Array.from(oldScript.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
          }
          
          // Handle different script types
          if (oldScript.src) {
            // External script with src
            newScript.src = oldScript.src;
            newScript.async = true;
            newScript.defer = true;
            
            // Create a promise for this script
            const promise = new Promise<void>((resolve, reject) => {
              newScript.onload = () => {
                console.log(`✅ Script loaded: ${oldScript.src.substring(0, 50)}...`);
                resolve();
              };
              newScript.onerror = () => {
                console.warn(`⚠️ Failed to load script: ${oldScript.src}`);
                resolve(); // Don't reject, just resolve
              };
            });
            scriptPromises.push(promise);
            
          } else if (oldScript.textContent) {
            // Inline script
            try {
              // Create a new script with the same content
              const inlineScript = document.createElement('script');
              if (oldScript.type) inlineScript.type = oldScript.type;
              inlineScript.textContent = oldScript.textContent;
              
              // Execute inline script
              document.head.appendChild(inlineScript);
              scriptElements.push(inlineScript);
              
              // Remove the original script element from container
              oldScript.parentNode?.removeChild(oldScript);
              
              console.log(`✅ Inline script executed for ${position}`);
            } catch (err) {
              console.warn(`⚠️ Error executing inline script:`, err);
            }
          }
          
          // Store reference for cleanup
          if (newScript.src) {
            document.head.appendChild(newScript);
            scriptElements.push(newScript);
          }
        });
        
        // Wait for all external scripts to load (or timeout)
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(resolve, 5000); // 5 second timeout
        });
        
        Promise.race([
          Promise.allSettled(scriptPromises),
          timeoutPromise
        ]).then(() => {
          if (isMounted) {
            console.log(`✅ Ad fully processed for ${position}`);
            setLoading(false);
            if (onAdLoaded) onAdLoaded();
          }
        }).catch((err) => {
          if (isMounted) {
            console.warn(`⚠️ Ad processing warning for ${position}:`, err);
            setLoading(false);
            if (onAdLoaded) onAdLoaded();
          }
        });
        
      } catch (err: any) {
        if (isMounted) {
          console.error(`❌ Error loading ad for ${position}:`, err);
          const errorMsg = err.message || 'Failed to load ad';
          setError(errorMsg);
          setLoading(false);
          
          if (onAdError) onAdError(errorMsg);
          
          // Show fallback placeholder
          if (adRef.current) {
            adRef.current.innerHTML = `
              <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
                <div class="text-slate-400 text-sm mb-2">📢 Advertisement Failed</div>
                <div class="text-slate-500 text-xs mb-3">${position} Slot</div>
                <div class="text-red-400 text-xs">Error: ${errorMsg}</div>
              </div>
            `;
          }
        }
      }
    };

    // Use Intersection Observer to load ad only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadAd();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    // Fallback: Load after 1 second if still not visible
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        loadAd();
      }
    }, 1000);

    // Cleanup function
    return () => {
      isMounted = false;
      observer.disconnect();
      clearTimeout(timeoutId);
      
      // Remove script elements we added
      scriptElements.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      
      // Clear container
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [adCode, isActive, position, adId, onAdLoaded, onAdError]);

  // Loading state
  if (loading) {
    return (
      <div className={`ad-slot ${className}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center animate-pulse">
          <div className="flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm mb-1">📢 Loading Advertisement</div>
            <div className="text-slate-500 text-xs mb-2">{position} Slot</div>
            <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`ad-slot ${className}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-sm mb-1">⚠️ Ad Error</div>
          <div className="text-slate-500 text-xs mb-2">{position} Slot</div>
          <div className="text-red-400 text-xs">{error}</div>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              setTimeout(() => {
                setLoading(false);
                if (adRef.current) {
                  adRef.current.innerHTML = `
                    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                      <div class="text-slate-400 text-sm mb-1">📢 Advertisement</div>
                      <div class="text-slate-500 text-xs">
                        ${position} Slot - Failed to load
                      </div>
                    </div>
                  `;
                }
              }, 100);
            }}
            className="mt-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      id={adId}
      className={`ad-slot ${className}`}
      data-position={position}
      data-ad-loaded="true"
      style={{
        minHeight: '90px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default AdSlot;
