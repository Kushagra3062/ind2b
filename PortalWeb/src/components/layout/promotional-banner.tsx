"use client"
          
          import Image from "next/image"
          
          export default function PromotionalBanner() {
            return (
              <section className="">
                
                {
                <div className="relative w-full">
                  <Image
                    src="/Delivery Banner-2.webp"
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
          
