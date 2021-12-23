using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BEL
{
    public class ProductModel
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
    }
}
