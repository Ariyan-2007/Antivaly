using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BEL
{
    public class CouponModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public double Discount { get; set; }
        public int NumOfUse { get; set; }
        public string Category { get; set; }
        public Nullable<double> MinOrder { get; set; }
        public System.DateTime CreatedAt { get; set; }
        public System.DateTime ExpiredAt { get; set; }
    }
}
