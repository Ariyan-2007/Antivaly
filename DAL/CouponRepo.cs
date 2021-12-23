using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class CouponRepo: IRepository<Coupon, string>
    {
        AntivalyEntities db;

        public CouponRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Coupon e)
        {
            this.db.Coupons.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(string id)
        {
            var coupon = db.Coupons.FirstOrDefault(c => c.Code == id);
            db.Coupons.Remove(coupon);
            db.SaveChanges();
        }

        public void Edit(Coupon e)
        {
            var c = db.Coupons.FirstOrDefault(en => en.Id == e.Id);
            db.Entry(c).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Coupon> Get()
        {
            return db.Coupons.ToList();
        }

        public Coupon Get(string id)
        {
            return db.Coupons.FirstOrDefault(c => c.Code == id);
        }
    }
}
