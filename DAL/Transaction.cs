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
    
    public partial class Transaction
    {
        public int TID { get; set; }
        public string UID { get; set; }
        public string TDetials { get; set; }
        public double TAmount { get; set; }
        public string DMID { get; set; }
        public string Status { get; set; }
        public string TDate { get; set; }
    
        public virtual User User { get; set; }
    }
}
