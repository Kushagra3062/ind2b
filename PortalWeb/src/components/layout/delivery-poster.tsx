"use client"

import Image from "next/image"

export default function DeliveryPoster() {
  return (
    <section className="">
      {/* 
        Image Size Recommendations for Perfect Fit:
        
        Based on the new heights (h-40 to h-56), here are the optimal image dimensions:
        
        Responsive Heights:
        - Mobile (h-40): 160px height
        - Small (h-44): 176px height  
        - Medium (h-48): 192px height
        - Large (h-52): 208px height
        - XL (h-56): 224px height
        
        Recommended Image Sizes:
        1. Standard Resolution: 1200x224px (5.36:1 aspect ratio)
        2. High Resolution: 2400x448px (for Retina displays)
        3. Ultra Wide: 1920x224px (for larger screens)
        
        Alternative Sizes:
        - Conservative: 1000x200px
        - Wide Format: 1500x280px
        - Banner Style: 1800x300px
        
        File Format Recommendations:
        - JPG: For photographic content (smaller file size)
        - PNG: For graphics with transparency or text
        - WebP: Best compression and quality (modern browsers)
        
        Optimization Tips:
        - Keep file size under 150KB for fast loading
        - Use progressive JPEG for better perceived performance
        - Consider lazy loading for below-the-fold content
      */}

      {/* Full width container with updated heights 
      <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56">
        <Image
          src="/poster1.webp"
          alt="On Time Delivery - Professional delivery service with fast delivery, professional service, and guaranteed quality"
          fill
          className="object-cover w-full h-full"
          sizes="100vw"
          priority
        />
      </div> */}

      {/* 
        Alternative approach - Full width with natural height:
        This stretches the image to full width and adjusts height accordingly
        Uncomment below if you prefer this approach:
      */}
      {
      <div className="relative w-full">
        <Image
          src="/Delivery Banner.webp"
          alt="On Time Delivery - Professional delivery service"
          width={1200}
          height={224}
          className="w-full h-auto object-cover"
          sizes="100vw"
          priority
        />
      </div>
      }

      {/* 
        Edge-to-edge approach (breaks out of container margins):
        Use this if you want the image to extend beyond page margins
        Uncomment below if needed:
      */}
      {/*
      <div className="relative w-screen h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56 -mx-4 sm:-mx-6 lg:-mx-8">
        <Image
          src="/poster1.webp"
          alt="On Time Delivery - Professional delivery service"
          fill
          className="object-cover w-full h-full"
          sizes="100vw"
          priority
        />
      </div>
      */}
    </section>
  )
}
