using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BEL
{
    public class DeliveryModel
    {
        public int ID { get; set; }
        public string UID { get; set; }
        public string Status { get; set; }
        public int NumOfOrders { get; set; }
        public double DeliveryCharge { get; set; }
        public int LevelCode { get; set; }
        public double Balance { get; set; }
    }
}
