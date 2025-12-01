 // components/AdSlot.tsx - UPDATED WORKING VERSION WITH ACTUAL AD CODE
import React, { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  position: string;
  className?: string;
  adCode?: string;
  isActive?: boolean;
}

const AdSlot: React.FC<AdSlotProps> = ({ 
  position, 
  className = '', 
  adCode, 
  isActive = true 
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adRef.current) {
      // Clear previous content
      adRef.current.innerHTML = '';
      
      if (adCode && isActive) {
        // Add loading indicator
        const loader = document.createElement('div');
        loader.innerHTML = `
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div class="text-slate-400 text-sm mb-1">📢 Loading Advertisement</div>
            <div class="text-slate-500 text-xs">${position} Slot</div>
          </div>
        `;
        adRef.current.appendChild(loader);

        // Create a temporary div to parse the ad code
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adCode;

        // Extract and execute scripts
        const scripts = tempDiv.getElementsByTagName('script');
        
        // Add all HTML content first
        Array.from(tempDiv.children).forEach(child => {
          if (child.tagName !== 'SCRIPT') {
            adRef.current?.appendChild(child.cloneNode(true));
          }
        });

        // Execute scripts sequentially
        const executeScripts = async () => {
          for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const newScript = document.createElement('script');
            
            // Copy all attributes
            Array.from(script.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy inner content if exists
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.textContent = script.textContent;
            }
            
            // Append to document head to execute
            document.head.appendChild(newScript);
          }
          
          setLoading(false);
          console.log(`✅ Ad loaded for position: ${position}`);
        };

        executeScripts().catch(err => {
          console.error(`❌ Error loading ad for ${position}:`, err);
          setLoading(false);
        });

      } else {
        setLoading(false);
      }
    }
  }, [adCode, isActive, position]);

  // If no ad code or inactive, show placeholder
  if (!adCode || !isActive) {
    return (
      <div className={`ad-slot ${className}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-sm mb-1">📢 Advertisement</div>
          <div className="text-slate-500 text-xs">
            {position} Slot - {!adCode ? 'No Ad Configured' : 'Inactive'}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`ad-slot ${className}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center animate-pulse">
          <div className="text-slate-400 text-sm mb-1">📢 Loading Ad...</div>
          <div className="text-slate-500 text-xs">{position} Slot</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`ad-slot ${className}`}
      data-position={position}
      data-ad-loaded="true"
    />
  );
};

export default AdSlot;
