//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class Product
    {
        public int PID { get; set; }
        public string UID { get; set; }
        public string CatName { get; set; }
        public string PName { get; set; }
        public int Qty { get; set; }
        public double Price { get; set; }
        public string Descr { get; set; }
        public string PStatus { get; set; }
        public Nullable<double> Discount { get; set; }
        public Nullable<System.DateTime> DiscountExp { get; set; }
    
        public virtual Category Category { get; set; }
        public virtual User User { get; set; }
    }
}
