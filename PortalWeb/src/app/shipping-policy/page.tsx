import React from 'react';
import { Truck, Clock, Shield, MapPin, Phone, Mail } from 'lucide-react';

const ShippingPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-black mb-4 text-center">Shipping & Delivery Policy</h1>
            <p className="text-base text-black text-left">
            The Shipping & Delivery Policy outlines the guidelines governing the shipment and delivery of goods between users of the Ind2B platform, which is accessible through 
            <a href="https://www.ind2b.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">www.ind2b.com</a>
             and its associated mobile or web-based applications. This Policy applies to all users of the platform, including sellers, buyers, logistics partners, and service intermediaries who engage in transactions or fulfill orders through Ind2B. The provisions of this Policy are binding on all commercial transactions initiated on the platform, regardless of the product category, delivery destination, or logistics method chosen by the parties involved.

            </p>
          </div>

         

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              
                Role of Ind2b
              </h2>
             <p className="text-base text-black text-left">Ind2B operates as a B2B marketplace technology provider that enables connections and transactions between buyers and sellers. 
                It does not own, store, manage, or directly handle any products or logistics involved in the transactions conducted on the platform. 
                All commercial terms, such as pricing, delivery timelines, freight arrangements, customs obligations, and product acceptance criteria, are independently negotiated
                 and agreed upon by the respective buyers and sellers without any involvement or intervention from Ind2B. The platform does not participate in these negotiations 
                 and is not a party to any contracts formed between users. Furthermore, Ind2B does not offer warehousing, shipping, freight forwarding, customs brokerage, or 
                 third-party logistics services unless such services are explicitly provided under separately agreed service add-ons.
             </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
               
                Shipping & Delivery Responsibilities
              </h2>
             <p className="text-lg font-bold text-black text-left">Sellers: </p>
             <p className="text-base text-black text-left mb-2">Sellers are responsible for the correct and timely dispatch of goods once an order is confirmed. They may choose to fulfill orders using their own logistics network, third-party logistics providers, or by arranging for the buyer to pick up the goods, as mutually agreed. Sellers must ensure that the goods are accurately packaged, properly labeled, and accompanied by all necessary documentation. They are also responsible for complying with all applicable domestic and cross-border shipping regulations, including customs duties, import and export licenses, and any product-specific legal requirements.
             </p>
             <p className="text-lg font-bold text-black text-left">Buyers: </p>
             <p className="text-base text-black text-left">Buyers are responsible for reviewing and agreeing upon the shipping terms, including Incoterms, delivery deadlines, insurance, and freight charges, before placing an order. Upon receipt of goods, buyers must inspect the shipment for quantity, condition, and compliance with the agreed specifications. They are also required to verify and accept all shipping documents, sign delivery notes, and maintain proper records for their internal processes and future reference.
            </p>

             </section> 
             <section className="mb-8">

             <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
               
               Shipping Documentation
             </h2>
              <p className="text-base text-black text-left mb-4">Sellers and buyers must ensure that all shipments are accompanied by mandatory shipping documents, which include invoices and tax documents along with:
              </p>
              <ul className="list-disc list-inside text-base text-black text-left space-y-2 mb-4">
                <li>Delivery challans or bills of lading must be provided with every shipment.</li>
                <li>Packing lists detailing the contents of the shipment are required.</li>
                <li>Transporter details and tracking information must be shared for transparency.</li>
                <li>Customs declarations must be completed and shared when applicable to cross-border transactions.</li>
                <li>Insurance certificates must be included if insurance coverage has been agreed upon.</li>
                <li> Both buyers and sellers are required to maintain all shipping and delivery documentation for a minimum of three years or as per the applicable legal requirements for audit, taxation, and dispute resolution purposes.</li>
              </ul>
            

           
             
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Business Risks and Risk Mitigation
              </h2>
             
              <ul className="list-disc list-inside text-base text-black text-left space-y-2 mb-4">
                <li>The transfer of title and risk of loss or damage will occur as per the mutually agreed Incoterms between the buyer and the seller.</li>
                <li>Ind2B does not assume ownership, custody, or any risk of loss at any stage of the transaction.
                </li>
                <li>Delays in delivery caused by logistics service failures, natural disasters, customs holds or inspections, labor strikes, public health emergencies, political unrest, or sanctions will be treated as force majeure events unless otherwise agreed in writing between the buyer and seller.</li>
                <li>The responsibility for goods that are damaged, lost, or stolen during transit lies with the party identified under the agreed shipping terms.</li>
                <li>Sellers are advised to obtain cargo insurance for shipments of high value to mitigate the risk of financial loss.</li>
                <li>Ind2B is not liable for any damage or loss that occurs during the transportation of goods.</li>
                <li>Sellers are responsible for ensuring that packaging is appropriate for the type of goods being shipped and the mode of transport used.</li>
                <li>Any damage resulting from improper packaging is the sole liability of the seller, even if the logistics provider was chosen by the buyer.</li>
                <li>Logistics providers are selected at the discretion of the buyer and/or seller as part of their commercial arrangement.</li>
                <li>Ind2B is not responsible for any errors, fraud, or misconduct by third-party logistics companies, including misrouting, false delivery claims, incomplete tracking updates, or losses caused by unauthorized subcontracting.</li>
                   
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4"> Customs and Cross-Border Transactions
              </h2>
              <p className="text-black mb-4">
              Customs clearance for cross-border transactions is the sole responsibility of the exporting seller and/or the importing buyer, depending on the mutually agreed Incoterms. It is the duty of the involved parties to ensure that all necessary documentation and regulatory filings are completed accurately and in a timely manner to facilitate the smooth movement of goods across borders.

              </p>
              <p>All import duties, taxes, and brokerage fees associated with international shipments must be borne by the party designated under the shipping agreement. The responsibility for these charges should be clearly outlined and agreed upon before the transaction is finalized to avoid any confusion or disputes.
                Failure to comply with relevant cross-border shipping regulations can lead to serious consequences, including the seizure of shipments by customs authorities, the imposition of fines or penalties, and the possible blacklisting of the shipper or consignee. Ind2B does not assume any responsibility for legal or regulatory non-compliance by users and will not be liable for any consequences arising from such violations.
              </p>
                        
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Dispute Resolution for Shipping & Delivery
              </h2>
              <p className="text-base text-black text-left mb-4">All disputes related to shipping, including issues concerning delivery timelines, product damage, shortages, or non-fulfillment of orders, must be addressed and resolved directly between the buyer and the seller. The responsibility for managing such commercial disputes lies solely with the transacting parties, and they are encouraged to have clear agreements and documentation in place to handle such situations effectively.
              </p>
              <p className="text-base text-black text-left">Ind2B does not act as a mediator, arbitrator, or adjudicator in disputes related to shipping or delivery. However, if there are reported cases involving fraud, misrepresentation, or violations of Ind2B’s platform policies, the platform reserves the right to take appropriate action. Such actions may include suspending or terminating the user’s account, restricting access to specific platform services, or cooperating with legal authorities when necessary to address violations or fraudulent conduct.</p>

             </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Amendments to the Policy
              </h2>
              <p className="text-base text-black text-left mb-4">
              Ind2B reserves the right to amend, modify, or update this Shipping & Delivery Policy at any time to reflect changes in legal requirements, technological advancements, or evolving business practices. Such revisions may be necessary to ensure that the Policy remains relevant, compliant, and aligned with the operational realities of the platform and its users.

              </p>
               <p className="text-base text-black text-left">All updated versions of this Policy will be published on the Ind2B platform. Users are responsible for reviewing the most current version of the Policy periodically. Continued use of the platform after any changes have been posted will constitute the user’s acceptance of the revised terms, making them binding on all subsequent transactions and interactions on the platform.
               </p>
              
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Contact for Support

              </h2>
              <p className="text-base text-black text-left mb-4">For Platform-related queries (not related to shipping disputes), please contact:</p> 
               <p className="text-base text-black text-left">Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@ind2b.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">support@ind2b.com</a></p>
              
              
            </section>


           
          </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
