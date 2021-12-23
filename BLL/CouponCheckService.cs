using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class CouponCheckService
    {
        public static void Create(CouponCheck b)
        {
            DataSupplier.CouponCheckDataAccess().Add(b);
        }

        public static void Edit(CouponCheck b)
        {
            DataSupplier.CouponCheckDataAccess().Edit(b);
        }

        public static void Delete(int id)
        {
            DataSupplier.CouponCheckDataAccess().Delete(id);
        }

        public static List<CouponCheck> Get()
        {
            return DataSupplier.CouponCheckDataAccess().Get(); ;
        }
        public static CouponCheck Get(int id)
        {
            return DataSupplier.CouponCheckDataAccess().Get(id);
        }
    }
}
