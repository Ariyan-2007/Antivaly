using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public interface ITransactionRepository<T, ID>: IRepository<T, ID>
    {
        void PlaceOrder(string list, string id);
        bool CancelOrder(ID id);
    }
}
