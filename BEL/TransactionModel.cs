using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BEL
{
    public class TransactionModel
    {
        public int TID { get; set; }
        public string UID { get; set; }
        public string TDetials { get; set; }
        public double TAmount { get; set; }
        public string DMID { get; set; }
        public string Status { get; set; }
        public string TDate { get; set; }
    }
}
